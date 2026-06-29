"use server";

// StudentProfile server actions — Phase 2 full implementation.

import { requireAuth } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity } from "@prisma/client";
import {
  StudentProfileSchema,
  UpdateStudentProfileSchema,
} from "@/schemas/student-profile";
import type {
  StudentProfileInput,
  UpdateStudentProfileInput,
} from "@/schemas/student-profile";
import { revalidatePath } from "next/cache";

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a StudentProfile for the authenticated user.
 * Throws if the user already has a profile.
 */
export async function createStudentProfile(data: StudentProfileInput) {
  const userId = await requireAuth();
  const parsed = StudentProfileSchema.parse(data);

  // Guard: prevent double creation
  const existing = await db.studentProfile.findUnique({
    where: { userId },
  });
  if (existing) {
    throw new Error("Student profile already exists. Use update instead.");
  }

  const profile = await db.studentProfile.create({
    data: { ...parsed, userId },
  });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.USER,
    entityId: userId,
    userId,
    metadata: { action: "CREATE_STUDENT_PROFILE" },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return profile;
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Partially updates the authenticated user's StudentProfile.
 * Creates the profile if it doesn't exist (upsert semantics).
 */
export async function updateStudentProfile(data: UpdateStudentProfileInput) {
  const userId = await requireAuth();
  const parsed = UpdateStudentProfileSchema.parse(data);

  const profile = await db.studentProfile.upsert({
    where: { userId },
    create: { userId, ...parsed },
    update: parsed,
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.USER,
    entityId: userId,
    userId,
    metadata: { action: "UPDATE_STUDENT_PROFILE", changes: Object.keys(parsed) },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return profile;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns the authenticated user's StudentProfile.
 * Returns null if no profile has been created yet.
 */
export async function getStudentProfile() {
  const userId = await requireAuth();

  return db.studentProfile.findUnique({
    where: { userId },
  });
}

/**
 * Returns a student's profile by their userId.
 * Intended for recruiter "applicant detail" view.
 * Returns safe public fields only.
 */
export async function getStudentProfileById(targetUserId: string) {
  await requireAuth();

  return db.studentProfile.findUnique({
    where: { userId: targetUserId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
        },
      },
    },
  });
}
