import { createGoogleGenerativeAI } from "@ai-sdk/google";

// ─── Gemini AI Client ─────────────────────────────────────────────────────────

/**
 * Creates a Google Generative AI provider instance.
 * Used by the Vercel AI SDK for text generation and structured output.
 */
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Centralized Model Configuration
 * Primary: gemini-3.7-flash (current generation fast model)
 * Fallback 1: gemini-3.6-flash
 * Fallback 2: gemini-3.8-flash
 */
export const PRIMARY_TEXT_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
export const FALLBACK_TEXT_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.6-flash";
export const SECONDARY_FALLBACK_TEXT_MODEL = "gemini-3.8-flash";

/**
 * The embedding model — gemini-embedding-001 (768-dim output).
 * Used for: job embeddings, resume embeddings, semantic similarity search.
 */
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

/**
 * Primary text generation model.
 */
export const geminiFlash = google(PRIMARY_TEXT_MODEL);

/**
 * Detects whether an error from Google/Gemini is transient (overloaded, rate limit, temporary spike, etc.).
 */
export function isTransientGeminiError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  return (
    lower.includes("high demand") ||
    lower.includes("spikes in demand") ||
    lower.includes("temporarily unavailable") ||
    lower.includes("service unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("rate limit") ||
    lower.includes("resource has been exhausted") ||
    lower.includes("quota exceeded") ||
    lower.includes("too many requests") ||
    lower.includes("429") ||
    lower.includes("503") ||
    lower.includes("502") ||
    lower.includes("504") ||
    lower.includes("econnreset") ||
    lower.includes("etimedout")
  );
}

/**
 * Sleep helper with exponential backoff and random jitter.
 * Formula: min(maxDelayMs, baseDelayMs * 2^attempt) + jitter(0 to jitterMs)
 */
export async function waitWithBackoff(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 4000,
  jitterMs: number = 400,
): Promise<void> {
  const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
  const jitter = Math.floor(Math.random() * jitterMs);
  const totalDelay = exponentialDelay + jitter;
  await new Promise((resolve) => setTimeout(resolve, totalDelay));
}

export interface RetryOptions {
  maxRetriesPerModel?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterMs?: number;
  operationName?: string;
}

/**
 * Executes a Gemini AI operation with bounded exponential backoff, jitter,
 * and automatic failover across tiered fallback models upon transient high-demand errors.
 */
export async function executeWithRetryAndFallback<T>(
  operation: (model: any, modelName: string) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetriesPerModel = 1, // 1 retry per model = 2 attempts per model tier
    baseDelayMs = 1200,
    maxDelayMs = 3500,
    jitterMs = 400,
    operationName = "Gemini Operation",
  } = options;

  // Build unique model tier chain
  const modelChain = [
    PRIMARY_TEXT_MODEL,
    FALLBACK_TEXT_MODEL,
    SECONDARY_FALLBACK_TEXT_MODEL,
  ].filter((name, index, self) => name && self.indexOf(name) === index);

  let lastError: unknown = null;

  for (let tier = 0; tier < modelChain.length; tier++) {
    const currentModelName = modelChain[tier];
    const currentModel = google(currentModelName);
    const isPrimary = tier === 0;

    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        if (!isPrimary || attempt > 0) {
          console.warn(
            `[${operationName}] Calling ${currentModelName} (Tier ${tier + 1}/${modelChain.length}, Attempt ${attempt + 1}/${maxRetriesPerModel + 1})...`,
          );
        }
        return await operation(currentModel, currentModelName);
      } catch (err: unknown) {
        lastError = err;
        const isTransient = isTransientGeminiError(err);
        console.warn(
          `[${operationName}] Model ${currentModelName} attempt ${attempt + 1} failed:`,
          err instanceof Error ? err.message : err,
        );

        // Non-transient errors (e.g. invalid inputs, prompt syntax, schema issues) fail immediately
        if (!isTransient) {
          throw err;
        }

        // If we have retries left on this model, back off with jitter
        if (attempt < maxRetriesPerModel) {
          await waitWithBackoff(attempt, baseDelayMs, maxDelayMs, jitterMs);
        }
      }
    }

    // If current model failed all transient attempts, log failover to next tier
    if (tier < modelChain.length - 1) {
      console.warn(
        `[${operationName}] Model ${currentModelName} is unavailable due to high demand. Failing over to ${modelChain[tier + 1]}...`,
      );
    }
  }

  // All tiers exhausted
  throw lastError;
}
