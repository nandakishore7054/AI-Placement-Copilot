"use server";

// Applications server actions — full implementation in Phase 3

import { requireAuth } from "@/lib/auth/helpers";
import {
  requireCompanyPermission,
  checkCompanyPermission,
  PERMISSIONS,
} from "@/lib/auth/rbac";
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
          company: { select: { id: true, name: true, logoUrl: true, verified: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function getApplicationById(applicationId: string) {
  const userId = await requireAuth();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              website: true,
              industry: true,
              size: true,
              description: true,
              verified: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    return null;
  }

  // Security: only the applicant themselves can view their application in student portal
  if (application.userId !== userId) {
    throw new Error("Unauthorized access to application.");
  }

  return application;
}

export async function getRecruiterApplications(companyId?: string, jobId?: string) {
  const userId = await requireAuth();

  // Find membership
  let member;
  if (companyId) {
    member = await db.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } },
      include: { company: true },
    });
  } else {
    member = await db.companyMember.findFirst({
      where: { userId },
      include: { company: true },
    });
  }

  if (!member) {
    return { applications: [], company: null, canUpdateStatus: false };
  }

  const targetCompanyId = member.companyId;
  await requireCompanyPermission(userId, targetCompanyId, PERMISSIONS.VIEW_APPLICANTS);
  const canUpdateStatus = await checkCompanyPermission(
    userId,
    targetCompanyId,
    PERMISSIONS.UPDATE_APPLICATION_STATUS
  );

  const applications = await db.application.findMany({
    where: {
      job: {
        companyId: targetCompanyId,
        ...(jobId && { id: jobId }),
      },
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          category: true,
          level: true,
          type: true,
          location: true,
          salary: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          studentProfile: {
            select: {
              bio: true,
              skills: true,
              education: true,
              expectedSalary: true,
              yearsOfExperience: true,
              linkedinUrl: true,
              githubUrl: true,
              portfolioUrl: true,
            },
          },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  return {
    applications,
    company: member.company,
    userRole: member.role,
    canUpdateStatus,
  };
}

export async function getRecruiterApplicationById(applicationId: string) {
  const userId = await requireAuth();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          company: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          studentProfile: true,
        },
      },
    },
  });

  if (!application) {
    return null;
  }

  const companyId = application.job.companyId;
  await requireCompanyPermission(userId, companyId, PERMISSIONS.VIEW_APPLICANTS);
  const canUpdateStatus = await checkCompanyPermission(
    userId,
    companyId,
    PERMISSIONS.UPDATE_APPLICATION_STATUS
  );

  return {
    application,
    canUpdateStatus,
  };
}

export async function updateApplicationStatus(
  applicationId: string,
  companyId: string,
  status: ApplicationStatus,
  notes?: string,
) {
  const userId = await requireAuth();
  await requireCompanyPermission(userId, companyId, PERMISSIONS.UPDATE_APPLICATION_STATUS);

  // Verify that the application actually belongs to a job from this company
  const existingApp = await db.application.findUnique({
    where: { id: applicationId },
    include: { job: { select: { companyId: true } } },
  });

  if (!existingApp) throw new Error("Application not found.");
  if (existingApp.job.companyId !== companyId) {
    throw new Error("Unauthorized: Application does not belong to this company.");
  }

  const application = await db.application.update({
    where: { id: applicationId },
    data: { status, ...(notes !== undefined && { notes }) },
  });

  await createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: AuditEntity.APPLICATION,
    entityId: applicationId,
    userId,
    metadata: {
      oldStatus: existingApp.status,
      newStatus: status,
      notes: notes || null,
      companyId,
    },
  });

  revalidatePath("/recruiter/applicants");
  revalidatePath(`/recruiter/applicants/${applicationId}`);
  revalidatePath("/recruiter/applications");
  revalidatePath(`/recruiter/applications/${applicationId}`);
  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  return application;
}

export async function withdrawApplication(applicationId: string) {
  const userId = await requireAuth();

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, status: true, jobId: true },
  });

  if (!application) throw new Error("Application not found.");
  if (application.userId !== userId) throw new Error("Unauthorized.");
  if (application.status === ApplicationStatus.ACCEPTED) {
    throw new Error("Cannot withdraw an accepted application.");
  }
  if (application.status === ApplicationStatus.WITHDRAWN) {
    throw new Error("Application is already withdrawn.");
  }

  const updated = await db.application.update({
    where: { id: applicationId },
    data: { status: ApplicationStatus.WITHDRAWN },
  });

  await createAuditLog({
    action: AuditAction.STATUS_CHANGE,
    entityType: AuditEntity.APPLICATION,
    entityId: applicationId,
    userId,
    metadata: {
      oldStatus: application.status,
      newStatus: ApplicationStatus.WITHDRAWN,
      jobId: application.jobId,
    },
  });

  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  return updated;
}
