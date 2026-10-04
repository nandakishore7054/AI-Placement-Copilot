"use server";

// Audit server actions — Admin only

import { db } from "@/lib/db";
import { requireUserRole } from "@/lib/auth/helpers";
import { UserRole, AuditAction, AuditEntity } from "@prisma/client";
import { AuditLogFiltersSchema, AuditRetentionSchema, type AuditLogFiltersInput } from "@/schemas/audit";
import { IdSchema } from "@/schemas/common";
import { cleanupOldAuditLogs } from "@/lib/audit";

export type AuditLogFilters = AuditLogFiltersInput;

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  await requireUserRole(UserRole.ADMIN);

  const parsed = AuditLogFiltersSchema.parse(filters ?? {});
  const { userId, action, entityType, entityId, page, pageSize } = parsed;

  const where = {
    ...(userId && { userId }),
    ...(action && { action }),
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
  };

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: Math.min(pageSize, 200),
    }),
    db.auditLog.count({ where }),
  ]);

  return { logs, total, page, pageSize, hasNextPage: page * pageSize < total };
}

export async function getUserAuditTrail(targetUserId: string) {
  await requireUserRole(UserRole.ADMIN);
  const validUserId = IdSchema.parse(targetUserId);

  return db.auditLog.findMany({
    where: { userId: validUserId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

/**
 * Admin action to manually trigger audit log retention cleanup (>90 days by default).
 */
export async function runAuditLogRetentionCleanupAction(input?: { retentionDays?: number }) {
  await requireUserRole(UserRole.ADMIN);
  const { retentionDays } = AuditRetentionSchema.parse(input ?? {});
  return cleanupOldAuditLogs(retentionDays);
}

