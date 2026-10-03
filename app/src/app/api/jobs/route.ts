import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { JobFiltersSchema } from "@/schemas/job";
import { JobLevel, JobType } from "@prisma/client";
import {
  checkRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/jobs — Public job listing with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, "PUBLIC_API");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const { searchParams } = new URL(req.url);
    const parsed = JobFiltersSchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid query parameters" },
        { status: 400 },
      );
    }

    const { search, category, location, level, type, page, pageSize } = parsed.data;

    const where = {
      isVisible: true,
      ...(category && { category }),
      ...(location && { location: { contains: location, mode: "insensitive" as const } }),
      ...(level && { level: level as JobLevel }),
      ...(type && { type: type as JobType }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { company: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logoUrl: true, verified: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.job.count({ where }),
    ]);

    const response = NextResponse.json({
      data: jobs,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
    });
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
