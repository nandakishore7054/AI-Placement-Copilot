import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IdSchema } from "@/schemas/common";
import {
  checkRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/jobs/[id] — Public single job detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimit = await checkRateLimit(req, "PUBLIC_API");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const { id } = await params;
    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const job = await db.job.findUnique({
      where: { id: parsedId.data, isVisible: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            description: true,
            industry: true,
            verified: true,
          },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const response = NextResponse.json(job);
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[GET /api/jobs/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}
