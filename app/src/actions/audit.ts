"use server";

// Audit server actions — Admin only

import { db } from "@/lib/db";
import { requireUserRole } from "@/lib/auth/helpers";
import { UserRole, AuditAction, AuditEntity } from "@prisma/client";

interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: AuditEntity;
  entityId?: string;
  page?: number;
  pageSize?: number;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  await requireUserRole(UserRole.ADMIN);

  const { userId, action, entityType, entityId, page = 1, pageSize = 50 } = filters;

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

  return db.auditLog.findMany({
    where: { userId: targetUserId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
