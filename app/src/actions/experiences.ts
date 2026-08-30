"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { requireCompanyPermission, PERMISSIONS } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity, JobLevel } from "@prisma/client";
import { CreateExperienceSchema, UpdateExperienceSchema } from "@/schemas/experience";
import type { CreateExperienceInput, UpdateExperienceInput } from "@/schemas/experience";
import { revalidatePath } from "next/cache";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExperienceFilters {
  search?: string;
  category?: string;
  level?: JobLevel | "";
  page?: number;
  pageSize?: number;
}

export type ExperienceWithCompany = NonNullable<
  Awaited<ReturnType<typeof db.experience.findUnique>>
> & {
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    verified: boolean;
    industry: string | null;
    website: string | null;
    description: string | null;
    size: string | null;
  };
};

export interface ExperienceListResult {
  experiences: ExperienceWithCompany[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Student Queries (Visible Only) ──────────────────────────────────────────

export async function getExperiences(
  filters: ExperienceFilters = {},
): Promise<ExperienceListResult> {
  const { search, category, level, page = 1, pageSize = DEFAULT_PAGE_SIZE } = filters;

  const where = {
    isVisible: true,
    ...(category && { category }),
    ...(level && { level: level as JobLevel }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { company: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
  };

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(pageSize, 50);

  const [experiences, total] = await Promise.all([
    db.experience.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verified: true,
            industry: true,
            website: true,
            description: true,
            size: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    db.experience.count({ where }),
  ]);

  return {
    experiences: experiences as ExperienceWithCompany[],
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

export async function getExperienceById(experienceId: string) {
  return db.experience.findFirst({
    where: { id: experienceId, isVisible: true },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          verified: true,
          industry: true,
          website: true,
          description: true,
          size: true,
        },
      },
    },
  });
}

// ─── Recruiter Queries & Mutations (RBAC & Company Isolation) ─────────────────

export async function getRecruiterExperiences(companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.VIEW_DASHBOARD);

  return db.experience.findMany({
    where: { companyId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          verified: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecruiterExperienceById(experienceId: string, companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.VIEW_DASHBOARD);

  const experience = await db.experience.findUnique({
    where: { id: experienceId },
    include: { company: true },
  });

  if (!experience || experience.companyId !== companyId) {
    return null;
  }

  return experience;
}

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
    metadata: { companyId, title: parsed.title },
  });

  revalidatePath("/recruiter/experiences");
  revalidatePath("/experiences");
  return experience;
}

export async function updateExperience(
  experienceId: string,
  companyId: string,
  data: UpdateExperienceInput,
) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.EDIT_EXPERIENCE);

  const existing = await db.experience.findUnique({
    where: { id: experienceId },
    select: { companyId: true },
  });

  if (!existing) throw new Error("Experience not found.");
  if (existing.companyId !== companyId) {
    throw new Error("Unauthorized: Experience does not belong to this company.");
  }

  const parsed = UpdateExperienceSchema.parse(data);

  const experience = await db.experience.update({
    where: { id: experienceId },
    data: parsed,
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.EXPERIENCE,
    entityId: experienceId,
    userId,
    metadata: { companyId, changes: Object.keys(parsed) },
  });

  revalidatePath("/recruiter/experiences");
  revalidatePath(`/recruiter/experiences/${experienceId}/edit`);
  revalidatePath("/experiences");
  revalidatePath(`/experiences/${experienceId}`);
  return experience;
}

export async function toggleExperienceVisibility(experienceId: string, companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.EDIT_EXPERIENCE);

  const existing = await db.experience.findUnique({
    where: { id: experienceId },
    select: { isVisible: true, companyId: true },
  });

  if (!existing) throw new Error("Experience not found.");
  if (existing.companyId !== companyId) {
    throw new Error("Unauthorized: Experience does not belong to this company.");
  }

  const updated = await db.experience.update({
    where: { id: experienceId },
    data: { isVisible: !existing.isVisible },
  });

  revalidatePath("/recruiter/experiences");
  revalidatePath("/experiences");
  return updated;
}

export async function deleteExperience(experienceId: string, companyId: string) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.EDIT_EXPERIENCE);

  const existing = await db.experience.findUnique({
    where: { id: experienceId },
    select: { companyId: true, title: true },
  });

  if (!existing) throw new Error("Experience not found.");
  if (existing.companyId !== companyId) {
    throw new Error("Unauthorized: Experience does not belong to this company.");
  }

  await db.experience.delete({ where: { id: experienceId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.EXPERIENCE,
    entityId: experienceId,
    userId,
    metadata: { companyId, title: existing.title },
  });

  revalidatePath("/recruiter/experiences");
  revalidatePath("/experiences");
}
