import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SubscribeSchema } from "@/schemas/auth";


export const dynamic = "force-dynamic";

// POST /api/subscribe — Email subscription (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // Upsert — reactivate if previously unsubscribed
    const subscription = await db.subscription.upsert({
      where: { email },
      create: { email, isActive: true },
      update: { isActive: true },
    });

    return NextResponse.json(
      { message: "Subscribed successfully", id: subscription.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/subscribe]", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 },
    );
  }
}
