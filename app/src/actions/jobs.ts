"use server";

// Jobs server actions — full implementation in Phase 3
// RBAC-gated stubs with correct signatures for TypeScript resolution.

import { requireAuth } from "@/lib/auth/helpers";
import { requireCompanyPermission, PERMISSIONS } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { saveJobEmbedding } from "@/lib/ai/embeddings";
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

  // Generate vector embedding for semantic search
  await saveJobEmbedding(job.id, {
    title: job.title,
    description: job.description,
    category: job.category,
    level: job.level,
    location: job.location,
    type: job.type,
  });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.JOB,
    entityId: job.id,
    userId,
    metadata: { companyId, title: job.title },
  });

  revalidatePath("/recruiter/jobs");
  revalidatePath("/jobs");
  return job;
}

export async function updateJob(
  jobId: string,
  companyId: string,
  data: UpdateJobInput,
) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.EDIT_JOB);

  const existing = await db.job.findUnique({
    where: { id: jobId },
    select: { companyId: true },
  });

  if (!existing) throw new Error("Job not found.");
  if (existing.companyId !== companyId) {
    throw new Error("Unauthorized: Job does not belong to this company.");
  }

  const parsed = UpdateJobSchema.parse(data);

  const job = await db.job.update({
    where: { id: jobId },
    data: parsed,
  });

  // Regenerate embedding if any searchable fields changed
  const searchableChanged =
    parsed.title !== undefined ||
    parsed.description !== undefined ||
    parsed.category !== undefined ||
    parsed.level !== undefined ||
    parsed.location !== undefined ||
    parsed.type !== undefined;

  if (searchableChanged) {
    await saveJobEmbedding(job.id, {
      title: job.title,
      description: job.description,
      category: job.category,
      level: job.level,
      location: job.location,
      type: job.type,
    });
  }

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.JOB,
    entityId: jobId,
    userId,
    metadata: { companyId, changes: Object.keys(parsed) },
  });

  revalidatePath("/recruiter/jobs");
  revalidatePath(`/recruiter/jobs/${jobId}/edit`);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  return job;
}

export async function toggleJobVisibility(jobId: string, companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.TOGGLE_JOB_VISIBILITY);

  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { isVisible: true, companyId: true },
  });

  if (!job) throw new Error("Job not found.");
  if (job.companyId !== companyId) {
    throw new Error("Unauthorized: Job does not belong to this company.");
  }

  const updated = await db.job.update({
    where: { id: jobId },
    data: { isVisible: !job.isVisible },
  });

  revalidatePath("/recruiter/jobs");
  revalidatePath("/jobs");
  return updated;
}

export async function deleteJob(jobId: string, companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.DELETE_JOB);

  const existing = await db.job.findUnique({
    where: { id: jobId },
    select: { companyId: true, title: true },
  });

  if (!existing) throw new Error("Job not found.");
  if (existing.companyId !== companyId) {
    throw new Error("Unauthorized: Job does not belong to this company.");
  }

  await db.job.delete({ where: { id: jobId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.JOB,
    entityId: jobId,
    userId,
    metadata: { companyId, title: existing.title },
  });

  revalidatePath("/recruiter/jobs");
  revalidatePath("/jobs");
}

