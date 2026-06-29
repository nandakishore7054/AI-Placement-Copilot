import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateEmbedding, formatEmbeddingForDb } from "@/lib/ai/embeddings";


export const dynamic = "force-dynamic";

// POST /api/jobs/search — Semantic search via pgvector cosine similarity
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, limit = 10 } = body;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 },
      );
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query.trim());
    const vectorLiteral = formatEmbeddingForDb(queryEmbedding);

    // Raw SQL for pgvector cosine similarity search
    // (Prisma does not support vector operators natively)
    const results = await db.$queryRaw<
      Array<{ id: string; similarity: number }>
    >`
      SELECT 
        id,
        1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM "Job"
      WHERE "isVisible" = true
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${Math.min(limit, 50)}
    `;

    if (results.length === 0) {
      return NextResponse.json({ data: [], total: 0 });
    }

    // Fetch full job data for matched IDs, preserving similarity order
    const jobIds = results.map((r) => r.id);
    const similarityMap = new Map(results.map((r) => [r.id, r.similarity]));

    const jobs = await db.job.findMany({
      where: { id: { in: jobIds }, isVisible: true },
      include: {
        company: {
          select: { id: true, name: true, logoUrl: true, verified: true },
        },
        _count: { select: { applications: true } },
      },
    });

    // Re-sort by similarity and attach score
    const sortedJobs = jobs
      .map((job) => ({ job, similarity: similarityMap.get(job.id) ?? 0 }))
      .sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({ data: sortedJobs, total: sortedJobs.length });
  } catch (error) {
    console.error("[POST /api/jobs/search]", error);
    return NextResponse.json(
      { error: "Semantic search failed" },
      { status: 500 },
    );
  }
}
