import { db } from "@/lib/db";
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "./gemini";

// ─── Embedding Generation ─────────────────────────────────────────────────────

/**
 * Generates a vector embedding for the given text using Gemini text-embedding-004.
 * Returns a float array of dimension 768.
 *
 * Used for:
 * - Job embeddings (title + description + category + metadata)
 * - Resume embeddings (extracted text)
 * - Query embeddings (semantic search)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text: text.slice(0, 8192) }] }, // Model token limit
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Embedding API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const values: number[] = data.embedding?.values;

  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Unexpected embedding dimensions: got ${values?.length}, expected ${EMBEDDING_DIMENSIONS}`,
    );
  }

  return values;
}

/**
 * Formats an embedding array as a PostgreSQL vector literal.
 * Example: [0.1, 0.2, ...] → "[0.1,0.2,...]"
 */
export function formatEmbeddingForDb(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Generates an embedding for a job listing.
 * Combines title + description for richer semantic representation.
 */
export async function generateJobEmbedding(
  title: string,
  description: string,
): Promise<number[]> {
  const text = `Job Title: ${title}\n\nJob Description: ${description}`;
  return generateEmbedding(text);
}

/**
 * Generates and stores the vector embedding for a Job record in PostgreSQL pgvector.
 * Safely catches errors to ensure non-blocking fallback if AI API is unavailable.
 */
export async function saveJobEmbedding(
  jobId: string,
  data: {
    title: string;
    description: string;
    category?: string;
    level?: string;
    location?: string;
    type?: string;
  },
): Promise<boolean> {
  try {
    const cleanDescription = data.description.replace(/<[^>]*>?/gm, " ").trim();
    const parts: string[] = [
      `Job Title: ${data.title}`,
      data.category ? `Category: ${data.category}` : "",
      data.level ? `Experience Level: ${data.level}` : "",
      data.location ? `Location: ${data.location}` : "",
      data.type ? `Job Type: ${data.type}` : "",
      `Description: ${cleanDescription}`,
    ].filter(Boolean);

    const text = parts.join("\n");
    const embedding = await generateEmbedding(text);
    const vectorLiteral = formatEmbeddingForDb(embedding);

    await db.$executeRaw`
      UPDATE "Job"
      SET embedding = ${vectorLiteral}::vector
      WHERE id = ${jobId}
    `;
    return true;
  } catch (error) {
    console.error(
      `[saveJobEmbedding] Could not generate/save embedding for Job (${jobId}):`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

/**
 * Generates an embedding for a resume's extracted text.
 */
export async function generateResumeEmbedding(
  extractedText: string,
): Promise<number[]> {
  return generateEmbedding(extractedText);
}

/**
 * Generates and stores the vector embedding for a Resume record in PostgreSQL pgvector.
 * Safely catches errors to ensure non-blocking fallback if AI API is unavailable.
 */
export async function saveResumeEmbedding(
  resumeId: string,
  extractedText: string,
): Promise<boolean> {
  try {
    const cleanText = extractedText.slice(0, 8192).trim();
    if (!cleanText) return false;

    const embedding = await generateResumeEmbedding(cleanText);
    const vectorLiteral = formatEmbeddingForDb(embedding);

    await db.$executeRaw`
      UPDATE "Resume"
      SET embedding = ${vectorLiteral}::vector
      WHERE id = ${resumeId}
    `;
    return true;
  } catch (error) {
    console.error(
      `[saveResumeEmbedding] Could not generate/save embedding for Resume (${resumeId}):`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

