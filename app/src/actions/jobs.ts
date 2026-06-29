"use server";

// Jobs server actions — full implementation in Phase 3
// RBAC-gated stubs with correct signatures for TypeScript resolution.

import { requireAuth } from "@/lib/auth/helpers";
import { requireCompanyPermission, PERMISSIONS } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { CreateJobSchema, UpdateJobSchema } from "@/schemas/job";
import type { CreateJobInput, UpdateJobInput } from "@/schemas/job";
import { revalidatePath } from "next/cache";

export async function createJob(companyId: string, data: CreateJobInput) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.POST_JOB);
  const parsed = CreateJobSchema.parse(data);

  const job = await db.job.create({
    data: { ...parsed, companyId },
  });

  // Phase 4: generate embedding after creation
  // await generateAndSaveJobEmbedding(job.id, job.title, job.description);

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.JOB,
    entityId: job.id,
    userId,
  });

  revalidatePath("/recruiter/jobs");
  return job;
}

export async function updateJob(
  jobId: string,
  companyId: string,
  data: UpdateJobInput,
) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.EDIT_JOB);
  const parsed = UpdateJobSchema.parse(data);

  const job = await db.job.update({
    where: { id: jobId },
    data: parsed,
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.JOB,
    entityId: jobId,
    userId,
    metadata: { changes: Object.keys(parsed) },
  });

  revalidatePath("/recruiter/jobs");
  return job;
}

export async function toggleJobVisibility(jobId: string, companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.TOGGLE_JOB_VISIBILITY);

  const job = await db.job.findUnique({ where: { id: jobId }, select: { isVisible: true } });
  if (!job) throw new Error("Job not found");

  const updated = await db.job.update({
    where: { id: jobId },
    data: { isVisible: !job.isVisible },
  });

  revalidatePath("/recruiter/jobs");
  return updated;
}

export async function deleteJob(jobId: string, companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.DELETE_JOB);

  await db.job.delete({ where: { id: jobId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.JOB,
    entityId: jobId,
    userId,
  });

  revalidatePath("/recruiter/jobs");
}
