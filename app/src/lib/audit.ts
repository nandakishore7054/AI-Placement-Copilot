import { db } from "@/lib/db";
import { AuditAction, AuditEntity, Prisma } from "@prisma/client";
import { headers } from "next/headers";

// ─── Audit Log Types ──────────────────────────────────────────────────────────

interface CreateAuditLogParams {
  action: AuditAction;
  entityType: AuditEntity;
  entityId: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

// ─── Audit Logger ─────────────────────────────────────────────────────────────

/**
 * Creates an audit log entry in the database.
 * Call this inside Server Actions after any significant state change.
 * Never throws — audit failures should not break the primary operation.
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ??
      headersList.get("x-real-ip") ??
      "unknown";
    const userAgent = headersList.get("user-agent") ?? "unknown";

    await db.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId ?? null,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log to console but never surface to caller
    console.error("[AuditLog] Failed to create audit entry:", error);
  }
}

/**
 * Convenience helper for logging AI generation events.
 */
export async function logAiGeneration(
  entityType: AuditEntity,
  entityId: string,
  userId: string,
  metadata?: Record<string, unknown>,
) {
  return createAuditLog({
    action: AuditAction.AI_GENERATE,
    entityType,
    entityId,
    userId,
    metadata,
  });
}

/**
 * Convenience helper for logging file upload events.
 */
export async function logUpload(
  entityType: AuditEntity,
  entityId: string,
  userId: string,
  metadata?: Record<string, unknown>,
) {
  return createAuditLog({
    action: AuditAction.UPLOAD,
    entityType,
    entityId,
    userId,
    metadata,
  });
}
