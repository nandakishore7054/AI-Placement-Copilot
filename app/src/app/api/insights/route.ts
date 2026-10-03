import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CareerInsightsFilterSchema } from "@/schemas/career";
import {
  checkRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/insights — Public career insights feed
export async function GET(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, "PUBLIC_API");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const { searchParams } = new URL(req.url);
    const parsed = CareerInsightsFilterSchema.safeParse({
      category: searchParams.get("category") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid query parameters" },
        { status: 400 },
      );
    }

    const { category, limit } = parsed.data;

    const insights = await db.careerInsight.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        category: true,
        title: true,
        content: true,
        dataPoints: true,
        source: true,
        createdAt: true,
      },
    });

    const response = NextResponse.json({ data: insights, total: insights.length });
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[GET /api/insights]", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
