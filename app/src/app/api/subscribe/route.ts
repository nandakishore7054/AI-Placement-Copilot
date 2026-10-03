import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { SubscribeSchema, UnsubscribeSchema } from "@/schemas/subscription";
import { sendWelcomeEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import {
  checkRateLimit,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ─── POST /api/subscribe ───────────────────────────────────────────────────────
// Handles public & authenticated subscriptions, and supports action: "unsubscribe"
export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, "SUBSCRIBE");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action === "unsubscribe" ? "unsubscribe" : "subscribe";

    const { userId } = await auth();

    // ── Handle Unsubscribe ──
    if (action === "unsubscribe") {
      const parsed = UnsubscribeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Valid email is required" },
          { status: 400 },
        );
      }

      const email = parsed.data.email.toLowerCase().trim();
      const existing = await db.subscription.findUnique({ where: { email } });

      if (!existing) {
        return NextResponse.json(
          { message: "Email is not subscribed" },
          { status: 200 },
        );
      }

      // Authorization guard
      if (userId && existing.userId && existing.userId !== userId) {
        return NextResponse.json(
          { error: "Unauthorized: Cannot unsubscribe another user's email" },
          { status: 403 },
        );
      }

      await db.subscription.update({
        where: { id: existing.id },
        data: { isActive: false },
      });

      await createAuditLog({
        action: AuditAction.UPDATE,
        entityType: AuditEntity.SUBSCRIPTION,
        entityId: existing.id,
        userId: userId ?? null,
        metadata: { email, action: "unsubscribe" },
      });

      return NextResponse.json(
        { message: "Unsubscribed successfully", id: existing.id },
        { status: 200 },
      );
    }

    // ── Handle Subscribe ──
    const parsed = SubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Valid email is required" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Upsert — reactivate if previously unsubscribed, or create new
    const subscription = await db.subscription.upsert({
      where: { email },
      create: {
        email,
        isActive: true,
        userId: userId ?? null,
      },
      update: {
        isActive: true,
        ...(userId ? { userId } : {}),
      },
    });

    // Record audit log
    await createAuditLog({
      action: AuditAction.CREATE,
      entityType: AuditEntity.SUBSCRIPTION,
      entityId: subscription.id,
      userId: userId ?? null,
      metadata: { email, action: "subscribe" },
    });

    // Send welcome email safely (never blocks or crashes)
    void sendWelcomeEmail(email);

    const response = NextResponse.json(
      { message: "Subscribed successfully", id: subscription.id },
      { status: 200 },
    );
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[POST /api/subscribe]", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/subscribe ─────────────────────────────────────────────────────
// RESTful unsubscribe endpoint
export async function DELETE(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, "SUBSCRIBE");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    const { userId } = await auth();
    const body = await req.json().catch(() => ({}));
    const emailParam = body?.email ?? new URL(req.url).searchParams.get("email");

    const parsed = UnsubscribeSchema.safeParse({ email: emailParam });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Valid email is required" },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await db.subscription.findUnique({ where: { email } });

    if (!existing) {
      return NextResponse.json(
        { message: "Email is not subscribed" },
        { status: 200 },
      );
    }

    if (userId && existing.userId && existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: Cannot unsubscribe another user's email" },
        { status: 403 },
      );
    }

    await db.subscription.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    await createAuditLog({
      action: AuditAction.UPDATE,
      entityType: AuditEntity.SUBSCRIPTION,
      entityId: existing.id,
      userId: userId ?? null,
      metadata: { email, action: "unsubscribe" },
    });

    const response = NextResponse.json(
      { message: "Unsubscribed successfully", id: existing.id },
      { status: 200 },
    );
    return applyRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("[DELETE /api/subscribe]", error);
    return NextResponse.json(
      { error: "Failed to process unsubscription" },
      { status: 500 },
    );
  }
}
