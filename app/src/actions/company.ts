"use server";

// Company server actions — Phase 2 full implementation.
// Extends Phase 1 stubs with all RBAC-gated operations.

import { requireAuth } from "@/lib/auth/helpers";
import { requireCompanyPermission, PERMISSIONS } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { AuditAction, AuditEntity, CompanyRole } from "@prisma/client";
import {
  CreateCompanySchema,
  UpdateCompanySchema,
  InviteMemberSchema,
  UpdateMemberRoleSchema,
} from "@/schemas/company";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
} from "@/schemas/company";
import { IdSchema, EmailSchema } from "@/schemas/common";
import { revalidatePath } from "next/cache";

// ─── Company CRUD ─────────────────────────────────────────────────────────────

/**
 * Creates a new company and assigns the creator as OWNER.
 * Uses a transaction to ensure atomicity.
 */
export async function createCompany(data: CreateCompanyInput) {
  const userId = await requireAuth();
  const parsed = CreateCompanySchema.parse(data);

  const [company] = await db.$transaction(async (tx) => {
    const newCompany = await tx.company.create({
      data: { ...parsed },
    });

    await tx.companyMember.create({
      data: { userId, companyId: newCompany.id, role: CompanyRole.OWNER },
    });

    // Mark user as RECRUITER if they aren't already
    await tx.user.update({
      where: { id: userId },
      data: { onboardingDone: true },
    });

    return [newCompany];
  });

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.COMPANY,
    entityId: company.id,
    userId,
    metadata: { name: company.name },
  });

  revalidatePath("/recruiter/dashboard");
  return company;
}

/**
 * Updates an existing company. Requires OWNER permission.
 */
export async function updateCompany(
  companyId: string,
  data: UpdateCompanyInput,
) {
  const userId = await requireAuth();
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.COMPANY_SETTINGS);
  const parsed = UpdateCompanySchema.parse(data);

  const company = await db.company.update({
    where: { id: validCompanyId },
    data: parsed,
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.COMPANY,
    entityId: validCompanyId,
    userId,
    metadata: { changes: Object.keys(parsed) },
  });

  revalidatePath(`/recruiter/company`);
  return company;
}

/**
 * Returns the authenticated user's company memberships with company data.
 */
export async function getMyCompanies() {
  const userId = await requireAuth();

  return db.companyMember.findMany({
    where: { userId },
    include: {
      company: true,
    },
    orderBy: { joinedAt: "asc" },
  });
}

/**
 * Returns a single company by ID with full member list.
 * User must be a member of the company.
 */
export async function getCompanyById(companyId: string) {
  const userId = await requireAuth();
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.VIEW_DASHBOARD);

  return db.company.findUnique({
    where: { id: validCompanyId },
    include: {
      members: {
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
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { jobs: true, experiences: true } },
    },
  });
}

/**
 * Deletes a company permanently. Requires OWNER role.
 * Cascades to all members, jobs, and experiences via Prisma.
 */
export async function deleteCompany(companyId: string) {
  const userId = await requireAuth();
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.DELETE_COMPANY);

  await db.company.delete({ where: { id: validCompanyId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.COMPANY,
    entityId: validCompanyId,
    userId,
  });

  revalidatePath("/recruiter/dashboard");
}

// ─── Team Member Management ───────────────────────────────────────────────────

/**
 * Returns all members of a company.
 * Requires at least INTERVIEWER role to view.
 */
export async function getCompanyMembers(companyId: string) {
  const userId = await requireAuth();
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.VIEW_DASHBOARD);

  return db.companyMember.findMany({
    where: { companyId: validCompanyId },
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
    orderBy: { joinedAt: "asc" },
  });
}

/**
 * Invites an existing user (by userId) to the company with a given role.
 * Requires ADMIN+ permission. Cannot assign OWNER role.
 */
export async function inviteMember(data: InviteMemberInput) {
  const userId = await requireAuth();
  const parsed = InviteMemberSchema.parse(data);

  await requireCompanyPermission(
    userId,
    parsed.companyId,
    PERMISSIONS.MANAGE_MEMBERS,
  );

  // Prevent assigning OWNER via invite
  if (parsed.role === CompanyRole.OWNER) {
    throw new Error("Cannot assign OWNER role via invitation. Use transfer ownership.");
  }

  const member = await db.companyMember.create({
    data: {
      userId: parsed.userId,
      companyId: parsed.companyId,
      role: parsed.role,
    },
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

  await createAuditLog({
    action: AuditAction.CREATE,
    entityType: AuditEntity.COMPANY_MEMBER,
    entityId: member.id,
    userId,
    metadata: { targetUserId: parsed.userId, role: parsed.role },
  });

  revalidatePath(`/recruiter/team`);
  return member;
}

/**
 * Updates a team member's role.
 * Cannot demote or promote to OWNER — use transferOwnership for that.
 */
export async function updateMemberRole(
  companyId: string,
  data: UpdateMemberRoleInput,
) {
  const userId = await requireAuth();
  const validCompanyId = IdSchema.parse(companyId);
  const parsed = UpdateMemberRoleSchema.parse(data);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.MANAGE_MEMBERS);

  // Verify the target member exists in this company
  const member = await db.companyMember.findFirst({
    where: { id: parsed.memberId, companyId: validCompanyId },
  });

  if (!member) throw new Error("Member not found in this company.");
  if (member.role === CompanyRole.OWNER) {
    throw new Error("Cannot change the OWNER's role. Use transfer ownership.");
  }
  if (member.userId === userId) {
    throw new Error("You cannot change your own role.");
  }

  const updated = await db.companyMember.update({
    where: { id: parsed.memberId },
    data: { role: parsed.role },
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

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.COMPANY_MEMBER,
    entityId: parsed.memberId,
    userId,
    metadata: { oldRole: member.role, newRole: parsed.role },
  });

  revalidatePath(`/recruiter/team`);
  return updated;
}

/**
 * Removes a team member from the company.
 * Cannot remove the OWNER. Requires MANAGE_MEMBERS permission.
 */
export async function removeMember(memberId: string, companyId: string) {
  const userId = await requireAuth();
  const validMemberId = IdSchema.parse(memberId);
  const validCompanyId = IdSchema.parse(companyId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.MANAGE_MEMBERS);

  const member = await db.companyMember.findFirst({
    where: { id: validMemberId, companyId: validCompanyId },
  });

  if (!member) throw new Error("Member not found.");
  if (member.role === CompanyRole.OWNER) {
    throw new Error("Cannot remove the company OWNER.");
  }
  if (member.userId === userId) {
    throw new Error("Use 'Leave Company' to remove yourself.");
  }

  await db.companyMember.delete({ where: { id: validMemberId } });

  await createAuditLog({
    action: AuditAction.DELETE,
    entityType: AuditEntity.COMPANY_MEMBER,
    entityId: validMemberId,
    userId,
    metadata: { removedUserId: member.userId },
  });

  revalidatePath(`/recruiter/team`);
}

/**
 * Transfers OWNER role to another current ADMIN.
 * Demotes the current OWNER to ADMIN.
 */
export async function transferOwnership(
  companyId: string,
  newOwnerMemberId: string,
) {
  const userId = await requireAuth();
  const validCompanyId = IdSchema.parse(companyId);
  const validNewOwnerMemberId = IdSchema.parse(newOwnerMemberId);
  await requireCompanyPermission(userId, validCompanyId, PERMISSIONS.DELETE_COMPANY);

  const newOwnerMember = await db.companyMember.findFirst({
    where: { id: validNewOwnerMemberId, companyId: validCompanyId },
  });

  if (!newOwnerMember) throw new Error("Target member not found.");
  if (newOwnerMember.userId === userId) {
    throw new Error("You are already the owner.");
  }

  const currentOwnerMember = await db.companyMember.findFirst({
    where: { companyId: validCompanyId, userId },
  });

  if (!currentOwnerMember) throw new Error("Owner record not found.");

  await db.$transaction([
    db.companyMember.update({
      where: { id: validNewOwnerMemberId },
      data: { role: CompanyRole.OWNER },
    }),
    db.companyMember.update({
      where: { id: currentOwnerMember.id },
      data: { role: CompanyRole.ADMIN },
    }),
  ]);

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.COMPANY_MEMBER,
    entityId: validNewOwnerMemberId,
    userId,
    metadata: { action: "TRANSFER_OWNERSHIP", newOwnerId: newOwnerMember.userId },
  });

  revalidatePath(`/recruiter/team`);
}

/**
 * Allows a non-OWNER member to leave a company voluntarily.
 */
export async function leaveCompany(companyId: string) {
  const userId = await requireAuth();
  const validCompanyId = IdSchema.parse(companyId);

  const member = await db.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId: validCompanyId } },
  });

  if (!member) throw new Error("You are not a member of this company.");
  if (member.role === CompanyRole.OWNER) {
    throw new Error(
      "Owners cannot leave. Transfer ownership first, then leave.",
    );
  }

  await db.companyMember.delete({
    where: { userId_companyId: { userId, companyId: validCompanyId } },
  });

  revalidatePath("/recruiter/dashboard");
}

/**
 * Searches for a registered user by email address.
 * Used in the "Invite Member" flow to find users to add to a company.
 * Returns safe public fields only.
 */
export async function searchUserByEmail(email: string) {
  await requireAuth();

  const parseResult = EmailSchema.safeParse(email);
  if (!parseResult.success) return null;
  const validEmail = parseResult.data;

  return db.user.findUnique({
    where: { email: validEmail },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      imageUrl: true,
      role: true,
    },
  });
}
