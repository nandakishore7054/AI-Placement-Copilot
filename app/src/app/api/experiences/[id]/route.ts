import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IdSchema } from "@/schemas/common";
import {
  checkRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/experiences/[id] — Public single experience detail
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
      return NextResponse.json({ error: "Invalid experience ID" }, { status: 400 });
    }

    const experience = await db.experience.findUnique({
      where: { id: parsedId.data, isVisible: true },
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

    const response = NextResponse.json(experience);
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[GET /api/experiences/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}
