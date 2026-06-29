"use server";

// Experience server actions — full implementation in Phase 3

import { requireAuth } from "@/lib/auth/helpers";
import { requireCompanyPermission, PERMISSIONS } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import { CreateExperienceSchema, UpdateExperienceSchema } from "@/schemas/experience";
import type { CreateExperienceInput, UpdateExperienceInput } from "@/schemas/experience";
import { revalidatePath } from "next/cache";

export async function createExperience(companyId: string, data: CreateExperienceInput) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.POST_EXPERIENCE);
  const parsed = CreateExperienceSchema.parse(data);

  const experience = await db.experience.create({
    data: { ...parsed, companyId },
  });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.EXPERIENCE,
    entityId: experience.id,
    userId,
  });

  revalidatePath("/recruiter/experiences");
  return experience;
}

export async function updateExperience(
  experienceId: string,
  companyId: string,
  data: UpdateExperienceInput,
) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.EDIT_EXPERIENCE);
  const parsed = UpdateExperienceSchema.parse(data);

  const experience = await db.experience.update({
    where: { id: experienceId },
    data: parsed,
  });

  revalidatePath("/recruiter/experiences");
  return experience;
}

export async function deleteExperience(experienceId: string, companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.EDIT_EXPERIENCE);

  await db.experience.delete({ where: { id: experienceId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.EXPERIENCE,
    entityId: experienceId,
    userId,
  });

  revalidatePath("/recruiter/experiences");
}
