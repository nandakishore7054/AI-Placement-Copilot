import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


export const dynamic = "force-dynamic";

// GET /api/insights — Public career insights feed
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

    const insights = await db.careerInsight.findMany({
      where: {
        isPublished: true,
        ...(category && { category: category as never }),
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

    return NextResponse.json({ data: insights, total: insights.length });
  } catch (error) {
    console.error("[GET /api/insights]", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
