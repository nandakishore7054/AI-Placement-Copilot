"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/helpers";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity, UserRole, CompanyRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { StudentProfileSchema } from "@/schemas/student-profile";
import { CreateCompanySchema } from "@/schemas/company";
import type { StudentProfileInput } from "@/schemas/student-profile";
import type { CreateCompanyInput } from "@/schemas/company";

// ─── Sync user role from Clerk (called after onboarding) ─────────────────────

export async function syncUserRole(role: UserRole) {
  const userId = await requireAuth();

  await db.user.update({
    where: { id: userId },
    data: { role, onboardingDone: true },
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.USER,
    entityId: userId,
    userId,
    metadata: { role },
  });

  revalidatePath("/dashboard");
}

// ─── Get current DB user ──────────────────────────────────────────────────────

export async function getCurrentUser() {
  const userId = await requireAuth();

  return db.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      companyMemberships: { include: { company: true } },
    },
  });
}

// ─── Complete student onboarding ──────────────────────────────────────────────
/**
 * Atomically:
 * 1. Sets user role to STUDENT
 * 2. Marks onboardingDone = true
 * 3. Creates the StudentProfile record
 */
export async function completeStudentOnboarding(data: StudentProfileInput) {
  const userId = await requireAuth();
  const parsed = StudentProfileSchema.parse(data);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role: UserRole.STUDENT, onboardingDone: true },
    });

    await tx.studentProfile.upsert({
      where: { userId },
      create: { userId, ...parsed },
      update: parsed,
    });
  });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.USER,
    entityId: userId,
    userId,
    metadata: { action: "STUDENT_ONBOARDING_COMPLETE" },
  });

  revalidatePath("/dashboard");
}

// ─── Complete recruiter onboarding ───────────────────────────────────────────
/**
 * Atomically:
 * 1. Sets user role to RECRUITER
 * 2. Marks onboardingDone = true
 * 3. Creates the Company record
 * 4. Creates CompanyMember with OWNER role
 */
export async function completeRecruiterOnboarding(data: CreateCompanyInput) {
  const userId = await requireAuth();
  const parsed = CreateCompanySchema.parse(data);

  const company = await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role: UserRole.RECRUITER, onboardingDone: true },
    });

    const newCompany = await tx.company.create({
      data: { ...parsed },
    });

    await tx.companyMember.create({
      data: { userId, companyId: newCompany.id, role: CompanyRole.OWNER },
    });

    return newCompany;
  });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.COMPANY,
    entityId: company.id,
    userId,
    metadata: { action: "RECRUITER_ONBOARDING_COMPLETE", companyName: company.name },
  });

  revalidatePath("/recruiter/dashboard");
  return company;
}

// ─── Generic onboarding role setter (fallback) ────────────────────────────────

export async function completeOnboarding(role: UserRole) {
  const userId = await requireAuth();

  await db.user.update({
    where: { id: userId },
    data: { role, onboardingDone: true },
  });

  revalidatePath("/dashboard");
}
