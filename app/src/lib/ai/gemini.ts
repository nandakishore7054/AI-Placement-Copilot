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
 * The primary text generation model — Gemini 3.6 Flash.
 * Used for: resume analysis, question generation, feedback analysis, skill gap analysis, roadmap generation.
 */
export const geminiFlash = google("gemini-3.6-flash");

/**
 * The embedding model — gemini-embedding-001 (768-dim output).
 * Used for: job embeddings, resume embeddings, semantic similarity search.
 */
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;
