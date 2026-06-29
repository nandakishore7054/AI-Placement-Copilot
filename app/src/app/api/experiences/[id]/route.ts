import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/experiences/[id] — Public single experience detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const experience = await db.experience.findUnique({
      where: { id, isVisible: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            website: true,
            industry: true,
            verified: true,
          },
        },
      },
    });

    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }

    return NextResponse.json(experience);
  } catch (error) {
    console.error("[GET /api/experiences/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}
