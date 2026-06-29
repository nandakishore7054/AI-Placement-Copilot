import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";


export const dynamic = "force-dynamic";

// GET /api/experiences — Public experience listing
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)),
      50,
    );
    const category = searchParams.get("category") ?? undefined;

    const where = {
      isVisible: true,
      ...(category && { category }),
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

    return NextResponse.json({
      data: experiences,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
    });
  } catch (error) {
    console.error("[GET /api/experiences]", error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}
