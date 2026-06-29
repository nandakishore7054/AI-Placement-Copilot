"use server";

import { db } from "@/lib/db";
import { SubscribeSchema } from "@/schemas/auth";

export async function subscribeToJobAlerts(email: string) {
  const parsed = SubscribeSchema.parse({ email });

  const subscription = await db.subscription.upsert({
    where: { email: parsed.email },
    create: { email: parsed.email, isActive: true },
    update: { isActive: true },
  });

  return subscription;
}

export async function unsubscribeFromJobAlerts(email: string) {
  await db.subscription.updateMany({
    where: { email },
    data: { isActive: false },
  });
}
