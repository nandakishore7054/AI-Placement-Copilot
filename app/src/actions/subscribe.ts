"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { SubscribeSchema, UnsubscribeSchema } from "@/schemas/subscription";
import { sendWelcomeEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface SubscriptionResult {
  success: boolean;
  isExisting?: boolean;
  subscription?: {
    id: string;
    email: string;
    isActive: boolean;
    subscribedAt: Date;
  } | null;
  message?: string;
  error?: string;
}

// ─── Subscribe Flow ───────────────────────────────────────────────────────────

/**
 * Subscribes a user or visitor to job alerts & weekly digests.
 * - Prevents duplicate active subscriptions
 * - Preserves existing subscription state
 * - Links to authenticated User record if logged in
 * - Dispatches a welcome email safely via Resend without breaking the transaction
 * - Records AuditLog entry
 */
export async function subscribeToJobAlerts(
  inputEmail?: string,
): Promise<SubscriptionResult> {
  try {
    const { userId } = await auth();

    let targetEmail = inputEmail?.trim();
    let firstName: string | undefined = undefined;

    // If authenticated, get user profile & verify identity
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true },
      });

      if (user) {
        firstName = user.firstName;
        // If no explicit email provided, default to user's registered account email
        if (!targetEmail) {
          targetEmail = user.email;
        }
      }
    }

    if (!targetEmail) {
      return {
        success: false,
        error: "Email address is required to subscribe.",
      };
    }

    // Validate email with Zod
    const parsed = SubscribeSchema.safeParse({ email: targetEmail });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid email address.",
      };
    }

    const cleanEmail = parsed.data.email.toLowerCase();

    // Check if subscription already exists for this email or userId
    const existing = await db.subscription.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(userId ? [{ userId }] : []),
        ],
      },
    });

    if (existing) {
      // If already active, prevent duplicate and return existing state cleanly
      if (existing.isActive) {
        return {
          success: true,
          isExisting: true,
          subscription: existing,
          message: "You are already actively subscribed to job alerts.",
        };
      }

      // Reactivate previous subscription
      const updated = await db.subscription.update({
        where: { id: existing.id },
        data: {
          email: cleanEmail,
          isActive: true,
          userId: userId ?? existing.userId,
        },
      });

      // Audit log
      await createAuditLog({
        action: AuditAction.UPDATE,
        entityType: AuditEntity.SUBSCRIPTION,
        entityId: updated.id,
        userId: userId ?? null,
        metadata: { email: cleanEmail, action: "reactivate" },
      });

      // Send welcome email safely (never throws)
      void sendWelcomeEmail(cleanEmail, firstName);

      revalidatePath("/dashboard");
      return {
        success: true,
        subscription: updated,
        message: "Your subscription to job alerts has been reactivated.",
      };
    }

    // Create new subscription record
    const subscription = await db.subscription.create({
      data: {
        email: cleanEmail,
        isActive: true,
        userId: userId ?? null,
      },
    });

    // Audit log
    await createAuditLog({
      action: AuditAction.CREATE,
      entityType: AuditEntity.SUBSCRIPTION,
      entityId: subscription.id,
      userId: userId ?? null,
      metadata: { email: cleanEmail, action: "subscribe" },
    });

    // Send welcome email safely (never throws)
    void sendWelcomeEmail(cleanEmail, firstName);

    revalidatePath("/dashboard");
    return {
      success: true,
      subscription,
      message: "Subscribed to job alerts successfully! Check your inbox for confirmation.",
    };
  } catch (error: any) {
    console.error("[subscribeToJobAlerts] Error:", error);
    return {
      success: false,
      error: error?.message || "Failed to process subscription.",
    };
  }
}

// ─── Unsubscribe Flow ─────────────────────────────────────────────────────────

/**
 * Unsubscribes an email or user from job alerts.
 * - Enforces authorization: authenticated users cannot unsubscribe other users' emails.
 * - Safely marks isActive: false
 * - Records AuditLog entry
 */
export async function unsubscribeFromJobAlerts(
  inputEmail?: string,
): Promise<SubscriptionResult> {
  try {
    const { userId } = await auth();

    let targetEmail = inputEmail?.trim();

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      });

      if (user && !targetEmail) {
        targetEmail = user.email;
      }
    }

    if (!targetEmail) {
      return {
        success: false,
        error: "Email address is required to unsubscribe.",
      };
    }

    const parsed = UnsubscribeSchema.safeParse({ email: targetEmail });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid email address.",
      };
    }

    const cleanEmail = parsed.data.email.toLowerCase();

    // Find target subscription
    const existing = await db.subscription.findUnique({
      where: { email: cleanEmail },
    });

    if (!existing || !existing.isActive) {
      return {
        success: true,
        message: "You are not currently subscribed to job alerts.",
      };
    }

    // Authorization check: if this subscription belongs to a different registered user, reject
    if (userId && existing.userId && existing.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized: You cannot modify subscription settings for another account.",
      };
    }

    const updated = await db.subscription.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    // Audit log
    await createAuditLog({
      action: AuditAction.UPDATE,
      entityType: AuditEntity.SUBSCRIPTION,
      entityId: updated.id,
      userId: userId ?? null,
      metadata: { email: cleanEmail, action: "unsubscribe" },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      subscription: updated,
      message: "You have been successfully unsubscribed from job alerts.",
    };
  } catch (error: any) {
    console.error("[unsubscribeFromJobAlerts] Error:", error);
    return {
      success: false,
      error: error?.message || "Failed to process unsubscription.",
    };
  }
}

// ─── Query Subscription Status ────────────────────────────────────────────────

/**
 * Returns the current subscription state for the authenticated user or an email query.
 */
export async function getSubscriptionStatus(): Promise<{
  isSubscribed: boolean;
  email?: string;
  subscribedAt?: Date;
}> {
  try {
    const { userId } = await auth();
    if (!userId) return { isSubscribed: false };

    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!subscription) {
      return { isSubscribed: false };
    }

    return {
      isSubscribed: true,
      email: subscription.email,
      subscribedAt: subscription.subscribedAt,
    };
  } catch (error) {
    console.error("[getSubscriptionStatus] Error:", error);
    return { isSubscribed: false };
  }
}
