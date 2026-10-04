"use server";

import { requireAuth } from "@/lib/auth/helpers";
import { requireCompanyPermission, PERMISSIONS } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity, JobLevel } from "@prisma/client";
import {
  CreateExperienceSchema,
  UpdateExperienceSchema,
  ExperienceFiltersSchema,
  CreateStudentExperienceSchema,
} from "@/schemas/experience";
import type {
  CreateExperienceInput,
  UpdateExperienceInput,
  CreateStudentExperienceInput,
} from "@/schemas/experience";
import { IdSchema } from "@/schemas/common";
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
  const parsedFilters = ExperienceFiltersSchema.parse(filters ?? {});
  const { search, category, level, page, pageSize } = parsedFilters;

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
  const validExperienceId = IdSchema.parse(experienceId);
  return db.experience.findFirst({
    where: { id: validExperienceId, isVisible: true },
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
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.VIEW_DASHBOARD);

  return db.experience.findMany({
    where: { companyId: validCompanyId },
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
  const validExperienceId = IdSchema.parse(experienceId);
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.VIEW_DASHBOARD);

  const experience = await db.experience.findUnique({
    where: { id: validExperienceId },
    include: { company: true },
  });

  if (!experience || experience.companyId !== validCompanyId) {
    return null;
  }

  return experience;
}

export async function createExperience(companyId: string, data: CreateExperienceInput) {
  const userId = await requireAuth();
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.POST_EXPERIENCE);
  const parsed = CreateExperienceSchema.parse(data);

  const experience = await db.experience.create({
    data: { ...parsed, companyId: validCompanyId },
  });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.EXPERIENCE,
    entityId: experience.id,
    userId,
    metadata: { companyId: validCompanyId, title: parsed.title },
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
  const validExperienceId = IdSchema.parse(experienceId);
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.EDIT_EXPERIENCE);

  const existing = await db.experience.findUnique({
    where: { id: validExperienceId },
    select: { companyId: true },
  });

  if (!existing) throw new Error("Experience not found.");
  if (existing.companyId !== validCompanyId) {
    throw new Error("Unauthorized: Experience does not belong to this company.");
  }

  const parsed = UpdateExperienceSchema.parse(data);

  const experience = await db.experience.update({
    where: { id: validExperienceId },
    data: parsed,
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.EXPERIENCE,
    entityId: validExperienceId,
    userId,
    metadata: { companyId: validCompanyId, changes: Object.keys(parsed) },
  });

  revalidatePath("/recruiter/experiences");
  revalidatePath(`/recruiter/experiences/${validExperienceId}/edit`);
  revalidatePath("/experiences");
  revalidatePath(`/experiences/${validExperienceId}`);
  return experience;
}

export async function toggleExperienceVisibility(experienceId: string, companyId: string) {
  const userId = await requireAuth();
  const validExperienceId = IdSchema.parse(experienceId);
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.EDIT_EXPERIENCE);

  const existing = await db.experience.findUnique({
    where: { id: validExperienceId },
    select: { isVisible: true, companyId: true },
  });

  if (!existing) throw new Error("Experience not found.");
  if (existing.companyId !== validCompanyId) {
    throw new Error("Unauthorized: Experience does not belong to this company.");
  }

  const updated = await db.experience.update({
    where: { id: validExperienceId },
    data: { isVisible: !existing.isVisible },
  });

  revalidatePath("/recruiter/experiences");
  revalidatePath("/experiences");
  return updated;
}

export async function deleteExperience(experienceId: string, companyId: string) {
  const userId = await requireAuth();
  const validExperienceId = IdSchema.parse(experienceId);
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.EDIT_EXPERIENCE);

  const existing = await db.experience.findUnique({
    where: { id: validExperienceId },
    select: { companyId: true, title: true },
  });

  if (!existing) throw new Error("Experience not found.");
  if (existing.companyId !== validCompanyId) {
    throw new Error("Unauthorized: Experience does not belong to this company.");
  }

  await db.experience.delete({ where: { id: validExperienceId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.EXPERIENCE,
    entityId: validExperienceId,
    userId,
    metadata: { companyId: validCompanyId, title: existing.title },
  });

  revalidatePath("/recruiter/experiences");
  revalidatePath("/experiences");
}

// ─── Student Submission Flow ──────────────────────────────────────────────────

export async function getCompaniesList() {
  return db.company.findMany({
    select: {
      id: true,
      name: true,
      logoUrl: true,
    },
    orderBy: { name: "asc" },
    take: 100,
  });
}

export async function createStudentExperience(data: CreateStudentExperienceInput) {
  const userId = await requireAuth();
  const parsed = CreateStudentExperienceSchema.parse(data);

  let targetCompanyId = parsed.companyId;

  if (targetCompanyId) {
    const existing = await db.company.findUnique({
      where: { id: targetCompanyId },
      select: { id: true },
    });
    if (!existing) {
      targetCompanyId = undefined;
    }
  }

  if (!targetCompanyId) {
    const match = await db.company.findFirst({
      where: {
        name: { equals: parsed.companyName, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (match) {
      targetCompanyId = match.id;
    } else {
      const cleanSlug = parsed.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20);
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      const newCompany = await db.company.create({
        data: {
          name: parsed.companyName.trim(),
          email: `${cleanSlug || "org"}-${randomSuffix}@placement-copilot.internal`,
          verified: false,
        },
      });
      targetCompanyId = newCompany.id;
    }
  }

  const formattedDescription = `
<div class="space-y-4">
  <div class="p-3 bg-muted/40 rounded-xl border border-border/50 text-sm">
    <p class="font-medium text-foreground">
      <strong>Difficulty:</strong> ${parsed.difficulty} &nbsp;|&nbsp; 
      <strong>Outcome:</strong> ${parsed.overallOutcome}
    </p>
  </div>

  <div class="space-y-1">
    <h3 class="text-base font-semibold text-foreground">Interview Rounds</h3>
    <p class="text-muted-foreground whitespace-pre-wrap">${parsed.rounds.trim()}</p>
  </div>

  <div class="space-y-1">
    <h3 class="text-base font-semibold text-foreground">Key Questions & Topics Asked</h3>
    <p class="text-muted-foreground whitespace-pre-wrap">${parsed.questions.trim()}</p>
  </div>

  <div class="space-y-1">
    <h3 class="text-base font-semibold text-foreground">Preparation Strategy</h3>
    <p class="text-muted-foreground whitespace-pre-wrap">${parsed.preparationStrategy.trim()}</p>
  </div>

  <div class="space-y-1">
    <h3 class="text-base font-semibold text-foreground">Advice & Tips for Peers</h3>
    <p class="text-muted-foreground whitespace-pre-wrap">${parsed.tips.trim()}</p>
  </div>
</div>
`.trim();

  const title = `${parsed.companyName.trim()} — ${parsed.role.trim()} Interview Experience`;

  const experience = await db.experience.create({
    data: {
      title,
      description: formattedDescription,
      category: parsed.category,
      level: parsed.level,
      salary: parsed.salary?.trim() || null,
      isVisible: true,
      companyId: targetCompanyId,
    },
  });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.EXPERIENCE,
    entityId: experience.id,
    userId,
    metadata: {
      companyId: targetCompanyId,
      companyName: parsed.companyName,
      title: experience.title,
      isStudentSubmission: true,
      difficulty: parsed.difficulty,
      overallOutcome: parsed.overallOutcome,
    },
  });

  revalidatePath("/experiences");
  revalidatePath(`/experiences/${experience.id}`);

  return { success: true, experienceId: experience.id };
}

