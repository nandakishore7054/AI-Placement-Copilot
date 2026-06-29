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
 * The primary text generation model — Gemini 2.0 Flash.
 * Used for: question generation, feedback analysis, skill gap analysis, roadmap generation.
 */
export const geminiFlash = google("gemini-2.0-flash-001");

/**
 * The embedding model — text-embedding-004.
 * Used for: job embeddings, resume embeddings (via raw API call).
 */
export const EMBEDDING_MODEL = "text-embedding-004";
export const EMBEDDING_DIMENSIONS = 768;
