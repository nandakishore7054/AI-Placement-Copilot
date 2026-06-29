import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";


export const dynamic = "force-dynamic";

// GET /api/jobs — Public job listing with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)),
      50,
    );
    const category = searchParams.get("category") ?? undefined;
    const location = searchParams.get("location") ?? undefined;
    const level = searchParams.get("level") ?? undefined;
    const type = searchParams.get("type") ?? undefined;

    const where = {
      isVisible: true,
      ...(category && { category }),
      ...(location && { location: { contains: location, mode: "insensitive" as const } }),
      ...(level && { level: level as never }),
      ...(type && { type: type as never }),
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

    return NextResponse.json({
      data: jobs,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
    });
  } catch (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
