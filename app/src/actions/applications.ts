"use server";

// Applications server actions — full implementation in Phase 3

import { requireAuth } from "@/lib/auth/helpers";
import { requireCompanyPermission, PERMISSIONS } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity, ApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function applyForJob(jobId: string) {
  const userId = await requireAuth();

  // Check for duplicate application
  const existing = await db.application.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });
  if (existing) throw new Error("You have already applied for this job.");

  const application = await db.application.create({
    data: { userId, jobId },
  });

  await createAuditLog({
    action: AuditAction.APPLY,
    entityType: AuditEntity.APPLICATION,
    entityId: application.id,
    userId,
    metadata: { jobId },
  });

  revalidatePath("/applications");
  return application;
}

export async function getUserApplications() {
  const userId = await requireAuth();

  return db.application.findMany({
    where: { userId },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true, logoUrl: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  companyId: string,
  status: ApplicationStatus,
  notes?: string,
) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.UPDATE_APPLICATION_STATUS);

  const application = await db.application.update({
    where: { id: applicationId },
    data: { status, ...(notes !== undefined && { notes }) },
  });

  await createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: AuditEntity.APPLICATION,
    entityId: applicationId,
    userId,
    metadata: { newStatus: status },
  });

  revalidatePath("/recruiter/applicants");
  return application;
}

export async function withdrawApplication(applicationId: string) {
  const userId = await requireAuth();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, status: true },
  });

  if (!application) throw new Error("Application not found.");
  if (application.userId !== userId) throw new Error("Unauthorized.");
  if (application.status === ApplicationStatus.ACCEPTED) {
    throw new Error("Cannot withdraw an accepted application.");
  }

  await db.application.update({
    where: { id: applicationId },
    data: { status: ApplicationStatus.WITHDRAWN },
  });

  revalidatePath("/applications");
}
