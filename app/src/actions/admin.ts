"use server";

import { db } from "@/lib/db";
import { requireUserRole } from "@/lib/auth/helpers";
import { createAuditLog } from "@/lib/audit";
import { UserRole, AuditAction, AuditEntity, InterviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ─── Platform Analytics ────────────────────────────────────────────────────────

export async function getAdminAnalytics() {
  await requireUserRole(UserRole.ADMIN);

  const [
    totalUsers,
    studentUsers,
    recruiterUsers,
    adminUsers,
    totalCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    totalInterviews,
    completedInterviews,
    totalSubscriptions,
    activeSubscriptions,
    totalResumes,
    totalSkillGaps,
    totalRoadmaps,
    recentSignups,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: UserRole.STUDENT } }),
    db.user.count({ where: { role: UserRole.RECRUITER } }),
    db.user.count({ where: { role: UserRole.ADMIN } }),
    db.company.count(),
    db.job.count(),
    db.job.count({ where: { isVisible: true } }),
    db.application.count(),
    db.interview.count(),
    db.interview.count({ where: { status: InterviewStatus.COMPLETED } }),
    db.subscription.count(),
    db.subscription.count({ where: { isActive: true } }),
    db.resume.count(),
    db.skillGap.count(),
    db.careerRoadmap.count(),
    db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      students: studentUsers,
      recruiters: recruiterUsers,
      admins: adminUsers,
    },
    companies: {
      total: totalCompanies,
    },
    jobs: {
      total: totalJobs,
      active: activeJobs,
      hidden: totalJobs - activeJobs,
    },
    applications: {
      total: totalApplications,
    },
    interviews: {
      total: totalInterviews,
      completed: completedInterviews,
    },
    subscriptions: {
      total: totalSubscriptions,
      active: activeSubscriptions,
    },
    aiMetrics: {
      resumesAnalyzed: totalResumes,
      skillGapsCalculated: totalSkillGaps,
      roadmapsGenerated: totalRoadmaps,
    },
    recentSignups,
  };
}

// ─── Content Moderation ────────────────────────────────────────────────────────

export async function getModerationJobs(options: {
  page?: number;
  pageSize?: number;
  search?: string;
} = {}) {
  await requireUserRole(UserRole.ADMIN);

  const { page = 1, pageSize = 20, search } = options;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { company: { name: { contains: search, mode: "insensitive" as const } } },
          { location: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, industry: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.job.count({ where }),
  ]);

  return {
    jobs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function adminToggleJobVisibility(jobId: string) {
  const adminUserId = await requireUserRole(UserRole.ADMIN);

  const existing = await db.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, isVisible: true, companyId: true },
  });

  if (!existing) {
    throw new Error("Job not found");
  }

  const updated = await db.job.update({
    where: { id: jobId },
    data: { isVisible: !existing.isVisible },
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.JOB,
    entityId: jobId,
    userId: adminUserId,
    metadata: {
      action: "ADMIN_MODERATION_TOGGLE_VISIBILITY",
      title: existing.title,
      companyId: existing.companyId,
      previousVisibility: existing.isVisible,
      newVisibility: updated.isVisible,
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  return updated;
}

// ─── User Administration ────────────────────────────────────────────────────────

export async function getAdminUsers(options: {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
} = {}) {
  await requireUserRole(UserRole.ADMIN);

  const { page = 1, pageSize = 25, role, search } = options;

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        studentProfile: { select: { id: true } },
        companyMemberships: {
          include: { company: { select: { name: true } } },
        },
        _count: {
          select: {
            applications: true,
            interviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function updateUserRoleByAdmin(targetUserId: string, newRole: UserRole) {
  const adminUserId = await requireUserRole(UserRole.ADMIN);

  // Prevent demoting the last active admin
  if (newRole !== UserRole.ADMIN) {
    const adminCount = await db.user.count({
      where: { role: UserRole.ADMIN },
    });
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { role: true, email: true },
    });

    if (targetUser?.role === UserRole.ADMIN && adminCount <= 1) {
      throw new Error("Cannot demote the sole administrator on the platform.");
    }
  }

  const updatedUser = await db.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  await createAuditLog({
    action: AuditAction.UPDATE,
    entityType: AuditEntity.USER,
    entityId: targetUserId,
    userId: adminUserId,
    metadata: {
      action: "ADMIN_UPDATE_USER_ROLE",
      newRole,
    },
  });

  revalidatePath("/admin/dashboard");
  return updatedUser;
}
