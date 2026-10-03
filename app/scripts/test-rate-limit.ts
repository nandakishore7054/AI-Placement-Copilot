/**
 * Automated Verification Test for Phase 8 Step 2: Rate Limiting on Public Endpoints
 * 
 * Verifies:
 * 1. IP resolution across header permutations (x-forwarded-for, x-real-ip, cf-connecting-ip)
 * 2. Allowed requests up to the configured limit
 * 3. Rate-limit rejection (429) when limits are exceeded
 * 4. Proper Retry-After and X-RateLimit-* headers
 * 5. Isolation between different client IP identifiers
 * 6. RateLimitResponse payload structure
 */

import {
  checkRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
  getClientIp,
  inMemoryLimiter,
  RATE_LIMIT_PRESETS,
} from "../src/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("=== Running Phase 8 Step 2 Rate Limiting Tests ===\n");

  // Reset in-memory limiter state before starting
  inMemoryLimiter.reset();

  // Test 1: getClientIp header parsing
  console.log("Suite 1: Client IP Resolution");
  {
    const req1 = new Request("https://example.com/api/test", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178" },
    });
    assert(getClientIp(req1) === "203.0.113.195", "Extracts first IP from multi-entry x-forwarded-for");

    const req2 = new Request("https://example.com/api/test", {
      headers: { "x-real-ip": "198.51.100.14" },
    });
    assert(getClientIp(req2) === "198.51.100.14", "Extracts IP from x-real-ip when x-forwarded-for is missing");

    const req3 = new Request("https://example.com/api/test", {
      headers: { "cf-connecting-ip": "192.0.2.1" },
    });
    assert(getClientIp(req3) === "192.0.2.1", "Extracts IP from cf-connecting-ip when other headers are missing");

    const req4 = new Request("https://example.com/api/test");
    assert(getClientIp(req4) === "127.0.0.1", "Falls back to 127.0.0.1 when no proxy headers are present");
  }

  // Test 2: SUBSCRIBE rate limiter (Limit: 5 requests / 60s)
  console.log("\nSuite 2: SUBSCRIBE Rate Limiting (Limit: 5 req / 60s)");
  {
    const testIp = "10.0.0.50";
    const req = new Request("https://example.com/api/subscribe", {
      headers: { "x-forwarded-for": testIp },
    });

    // Make 5 allowed requests
    for (let i = 1; i <= 5; i++) {
      const res = await checkRateLimit(req, "SUBSCRIBE");
      assert(
        res.success === true && res.remaining === 5 - i,
        `Request #${i} permitted with remaining: ${5 - i}`,
      );
    }

    // 6th request must be rejected
    const blockedRes = await checkRateLimit(req, "SUBSCRIBE");
    assert(blockedRes.success === false, "6th request rejected (limit exceeded)");
    assert(blockedRes.remaining === 0, "Remaining count is 0 on rejected request");
    assert(blockedRes.reset > Date.now(), "Reset timestamp is in the future");

    // Verify 429 Response construction
    const response429 = createRateLimitResponse(blockedRes);
    assert(response429.status === 429, "Returns HTTP 429 status code");
    assert(response429.headers.has("Retry-After"), "Includes Retry-After header");
    assert(Number(response429.headers.get("Retry-After")) > 0, "Retry-After is positive");
    assert(response429.headers.get("X-RateLimit-Limit") === "5", "X-RateLimit-Limit matches preset");
    assert(response429.headers.get("X-RateLimit-Remaining") === "0", "X-RateLimit-Remaining is 0");

    const body = await response429.json();
    assert(typeof body.error === "string" && body.error.includes("Too many requests"), "Response contains clean error message");
    assert(typeof body.retryAfter === "number", "Response body includes numeric retryAfter");
  }

  // Test 3: Client Isolation (Different IPs have distinct buckets)
  console.log("\nSuite 3: Client IP Bucket Isolation");
  {
    const ipA = "10.0.0.1";
    const ipB = "10.0.0.2";

    const reqA = new Request("https://example.com/api/subscribe", {
      headers: { "x-forwarded-for": ipA },
    });
    const reqB = new Request("https://example.com/api/subscribe", {
      headers: { "x-forwarded-for": ipB },
    });

    // Exhaust IP A
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(reqA, "SUBSCRIBE");
    }
    const resA = await checkRateLimit(reqA, "SUBSCRIBE");
    assert(resA.success === false, "IP A is rate-limited after 5 requests");

    // IP B should still be completely unconstrained
    const resB = await checkRateLimit(reqB, "SUBSCRIBE");
    assert(resB.success === true && resB.remaining === 4, "IP B is unaffected by IP A's rate limiting");
  }

  // Test 4: AI_GENERATE rate limiter (Limit: 10 req / 60s)
  console.log("\nSuite 4: AI_GENERATE Rate Limiting (Limit: 10 req / 60s)");
  {
    const testIp = "10.0.0.80";
    const req = new Request("https://example.com/api/vapi/generate", {
      headers: { "x-forwarded-for": testIp },
    });

    for (let i = 1; i <= 10; i++) {
      const res = await checkRateLimit(req, "AI_GENERATE");
      assert(res.success === true, `AI generate request #${i} allowed`);
    }

    const blocked = await checkRateLimit(req, "AI_GENERATE");
    assert(blocked.success === false, "AI generate 11th request blocked with 429");
  }

  // Test 5: SEARCH rate limiter (Limit: 20 req / 60s)
  console.log("\nSuite 5: SEARCH Rate Limiting (Limit: 20 req / 60s)");
  {
    const testIp = "10.0.0.90";
    const req = new Request("https://example.com/api/jobs/search", {
      headers: { "x-forwarded-for": testIp },
    });

    for (let i = 1; i <= 20; i++) {
      const res = await checkRateLimit(req, "SEARCH");
      assert(res.success === true, `Search request #${i} allowed`);
    }

    const blocked = await checkRateLimit(req, "SEARCH");
    assert(blocked.success === false, "Search 21st request blocked with 429");
  }

  // Test 6: applyRateLimitHeaders decoration
  console.log("\nSuite 6: applyRateLimitHeaders Decoration");
  {
    const initialResponse = NextResponse.json({ ok: true });
    const decorated = applyRateLimitHeaders(initialResponse, {
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60000,
    });

    assert(decorated.headers.get("X-RateLimit-Limit") === "60", "Applies X-RateLimit-Limit");
    assert(decorated.headers.get("X-RateLimit-Remaining") === "59", "Applies X-RateLimit-Remaining");
    assert(Number(decorated.headers.get("X-RateLimit-Reset")) > 0, "Applies X-RateLimit-Reset");
  }

  console.log(`\n==================================================`);
  console.log(`Test Results: ${passedTests}/${totalTests} passed`);
  if (passedTests === totalTests) {
    console.log("ALL RATE LIMITING TESTS PASSED SUCCESSFULLY! ✓✓✓");
  } else {
    console.error("SOME TESTS FAILED!");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
