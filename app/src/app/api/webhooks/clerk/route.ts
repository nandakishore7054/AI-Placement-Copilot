import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";


export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set in environment variables.");
  }

  // Get Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  // Get and verify the webhook payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[Clerk Webhook] Verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;

  // ─── user.created ──────────────────────────────────────────────────────────
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find(
      (e) => e.id === evt.data.primary_email_address_id,
    );

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No primary email found" },
        { status: 400 },
      );
    }

    await db.user.upsert({
      where: { id },
      update: {
        email: primaryEmail.email_address,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        imageUrl: image_url ?? null,
      },
      create: {
        id,
        email: primaryEmail.email_address,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        imageUrl: image_url ?? null,
        role: UserRole.STUDENT,
      },
    });

    console.log(`[Clerk Webhook] Created user: ${id}`);
  }

  // ─── user.updated ──────────────────────────────────────────────────────────
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find(
      (e) => e.id === evt.data.primary_email_address_id,
    );

    await db.user.update({
      where: { id },
      data: {
        email: primaryEmail?.email_address,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        imageUrl: image_url ?? null,
      },
    });

    console.log(`[Clerk Webhook] Updated user: ${id}`);
  }

  // ─── user.deleted ──────────────────────────────────────────────────────────
  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await db.user.delete({ where: { id } });
      console.log(`[Clerk Webhook] Deleted user: ${id}`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
