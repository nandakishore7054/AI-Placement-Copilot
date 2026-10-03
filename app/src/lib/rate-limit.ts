import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Types & Configuration ───────────────────────────────────────────────────

export type RateLimitPresetKey = "SEARCH" | "AI_GENERATE" | "SUBSCRIBE" | "PUBLIC_API";

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
  windowStr: `${number} s` | `${number} m` | `${number} h`;
  description: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in ms
}

export const RATE_LIMIT_PRESETS: Record<RateLimitPresetKey, RateLimitConfig> = {
  SEARCH: {
    requests: 20,
    windowMs: 60 * 1000,
    windowStr: "60 s",
    description: "Semantic job vector search (AI embedding + pgvector)",
  },
  AI_GENERATE: {
    requests: 10,
    windowMs: 60 * 1000,
    windowStr: "60 s",
    description: "AI question generation (Gemini LLM)",
  },
  SUBSCRIBE: {
    requests: 5,
    windowMs: 60 * 1000,
    windowStr: "60 s",
    description: "Email job alert subscriptions (Resend API)",
  },
  PUBLIC_API: {
    requests: 60,
    windowMs: 60 * 1000,
    windowStr: "60 s",
    description: "General public reading endpoints",
  },
};

// ─── Redis & Upstash Setup ────────────────────────────────────────────────────

const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

let redisClient: Redis | null = null;
if (isUpstashConfigured) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (err) {
    console.warn("[RateLimit] Failed to initialize Upstash Redis client:", err);
    redisClient = null;
  }
}

// Map of Upstash Ratelimit instances per preset
const upstashLimiters: Partial<Record<RateLimitPresetKey, Ratelimit>> = {};

if (redisClient) {
  for (const [key, config] of Object.entries(RATE_LIMIT_PRESETS) as [RateLimitPresetKey, RateLimitConfig][]) {
    upstashLimiters[key] = new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(config.requests, config.windowStr),
      prefix: `ratelimit:${key.toLowerCase()}`,
      analytics: false,
    });
  }
}

// ─── In-Memory Sliding Window Fallback ─────────────────────────────────────────
// Used when Upstash is not configured (local dev, test environments) or on transient Redis error.

class InMemorySlidingWindowLimiter {
  private hits = new Map<string, number[]>();
  private lastPrune = Date.now();

  check(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();

    // Periodic prune of expired entries (every 60s)
    if (now - this.lastPrune > 60000) {
      this.prune(now, windowMs);
      this.lastPrune = now;
    }

    const windowStart = now - windowMs;
    const timestamps = (this.hits.get(key) || []).filter((ts) => ts > windowStart);

    if (timestamps.length < limit) {
      timestamps.push(now);
      this.hits.set(key, timestamps);
      return {
        success: true,
        limit,
        remaining: limit - timestamps.length,
        reset: now + windowMs,
      };
    }

    // Rate limit exceeded: calculate earliest reset time
    const oldestTimestamp = timestamps[0] ?? now;
    const reset = oldestTimestamp + windowMs;

    return {
      success: false,
      limit,
      remaining: 0,
      reset,
    };
  }

  private prune(now: number, windowMs: number) {
    const windowStart = now - windowMs;
    for (const [key, timestamps] of this.hits.entries()) {
      const active = timestamps.filter((ts) => ts > windowStart);
      if (active.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, active);
      }
    }
  }

  // Exposed for automated testing
  reset() {
    this.hits.clear();
  }
}

export const inMemoryLimiter = new InMemorySlidingWindowLimiter();

// ─── Client Identifier Resolution ─────────────────────────────────────────────

export function getClientIp(req: Request | NextRequest): string {
  // 1. Try NextRequest headers or standard Request headers
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();

  return "127.0.0.1";
}

// ─── Core Rate Limit Check ────────────────────────────────────────────────────

/**
 * Checks rate limits for a request against a named preset.
 * Uses Upstash Redis with sliding window if configured, falling back to in-memory sliding window.
 */
export async function checkRateLimit(
  req: Request | NextRequest,
  presetKey: RateLimitPresetKey,
  customIdentifier?: string,
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_PRESETS[presetKey];
  const ip = getClientIp(req);
  const identifier = customIdentifier || `${presetKey.toLowerCase()}:${ip}`;

  // Try Upstash Redis if available
  const upstashLimiter = upstashLimiters[presetKey];
  if (upstashLimiter) {
    try {
      const result = await upstashLimiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      console.warn(
        `[RateLimit] Upstash Redis call failed for ${identifier}, falling back to in-memory:`,
        error instanceof Error ? error.message : error,
      );
      // Gracefully fall back to in-memory sliding window
    }
  }

  // Fallback: In-Memory Sliding Window
  return inMemoryLimiter.check(identifier, config.requests, config.windowMs);
}

// ─── Response Helpers ─────────────────────────────────────────────────────────

/**
 * Creates a standard HTTP 429 response with appropriate Retry-After and rate limit headers.
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  customMessage?: string,
): NextResponse {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  const message =
    customMessage ||
    `Too many requests. Please wait ${retryAfterSeconds} second${
      retryAfterSeconds === 1 ? "" : "s"
    } before trying again.`;

  return NextResponse.json(
    {
      error: message,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
      },
    },
  );
}

/**
 * Attaches standard rate-limiting headers to any successful NextResponse.
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set(
    "X-RateLimit-Reset",
    Math.ceil(result.reset / 1000).toString(),
  );
  return response;
}
