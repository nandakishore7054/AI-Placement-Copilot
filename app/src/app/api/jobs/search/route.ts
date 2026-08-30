import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateEmbedding, formatEmbeddingForDb } from "@/lib/ai/embeddings";

export const dynamic = "force-dynamic";

interface SearchMatchRow {
  id: string;
  similarity: number;
}

/**
 * Handles core semantic search logic using pgvector cosine similarity.
 */
async function performSemanticSearch(query: string, limitCount: number) {
  const trimmed = query.trim();

  if (!trimmed || trimmed.length < 2) {
    return {
      error: "Search query must be at least 2 characters long.",
      status: 400,
    };
  }

  if (trimmed.length > 500) {
    return {
      error: "Search query cannot exceed 500 characters.",
      status: 400,
    };
  }

  const safeLimit = Math.min(Math.max(1, limitCount), 50);

  // 1. Generate 768-dimensional vector embedding for the query
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(trimmed);
  } catch (error) {
    console.error("[SemanticSearch] Embedding generation error:", error);
    return {
      error: "Semantic search service is temporarily unavailable. Please try again.",
      status: 503,
    };
  }

  const vectorLiteral = formatEmbeddingForDb(queryEmbedding);

  // 2. Query PostgreSQL pgvector with cosine distance operator (<=>)
  // Filters exclusively for visible jobs with existing vector embeddings
  let rawMatches: SearchMatchRow[];
  try {
    rawMatches = await db.$queryRaw<SearchMatchRow[]>`
      SELECT 
        id,
        1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM "Job"
      WHERE "isVisible" = true
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${safeLimit}
    `;
  } catch (error) {
    console.error("[SemanticSearch] Database vector query error:", error);
    return {
      error: "An error occurred while searching for jobs. Please try again later.",
      status: 500,
    };
  }

  if (rawMatches.length === 0) {
    return {
      data: {
        data: [],
        total: 0,
        query: trimmed,
      },
      status: 200,
    };
  }

  // 3. Fetch job details and company metadata for matched IDs
  const jobIds = rawMatches.map((r) => r.id);
  const similarityMap = new Map(rawMatches.map((r) => [r.id, Number(r.similarity)]));

  const jobs = await db.job.findMany({
    where: { id: { in: jobIds }, isVisible: true },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          website: true,
          industry: true,
          size: true,
          verified: true,
        },
      },
      _count: { select: { applications: true } },
    },
  });

  // 4. Map, attach matchScore (0-100), and sort by similarity descending
  const sortedResults = jobs
    .map((job) => {
      const rawSim = similarityMap.get(job.id) ?? 0;
      const similarity = Number(rawSim.toFixed(4));
      const matchScore = Math.round(Math.max(0, Math.min(1, rawSim)) * 100);

      return {
        job,
        matchScore,
        similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  return {
    data: {
      data: sortedResults,
      total: sortedResults.length,
      query: trimmed,
    },
    status: 200,
  };
}

// ─── GET /api/jobs/search?q=frontend+developer&limit=10 ──────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? searchParams.get("query") ?? "";
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    const result = await performSemanticSearch(query, isNaN(limit) ? 10 : limit);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[GET /api/jobs/search] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error during search." },
      { status: 500 },
    );
  }
}

// ─── POST /api/jobs/search — { query: "frontend developer", limit: 10 } ──────

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body provided." },
        { status: 400 },
      );
    }

    const query = body?.query ?? body?.q ?? "";
    const limit = parseInt(body?.limit ?? "10", 10);

    if (typeof query !== "string") {
      return NextResponse.json(
        { error: "Search query must be a string." },
        { status: 400 },
      );
    }

    const result = await performSemanticSearch(query, isNaN(limit) ? 10 : limit);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("[POST /api/jobs/search] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error during search." },
      { status: 500 },
    );
  }
}
