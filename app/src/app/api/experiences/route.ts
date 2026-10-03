import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ExperienceFiltersSchema } from "@/schemas/experience";
import { JobLevel } from "@prisma/client";
import {
  checkRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/experiences — Public experience listing
export async function GET(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, "PUBLIC_API");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const { searchParams } = new URL(req.url);
    const parsed = ExperienceFiltersSchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid query parameters" },
        { status: 400 },
      );
    }

    const { search, category, level, page, pageSize } = parsed.data;

    const where = {
      isVisible: true,
      ...(category && { category }),
      ...(level && { level: level as JobLevel }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { company: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [experiences, total] = await Promise.all([
      db.experience.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logoUrl: true, verified: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.experience.count({ where }),
    ]);

    const response = NextResponse.json({
      data: experiences,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
    });
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[GET /api/experiences]", error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}
