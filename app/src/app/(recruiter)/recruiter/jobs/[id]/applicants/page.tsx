import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { getRecruiterApplications } from "@/actions/applications";
import { RecruiterApplicantsClient } from "@/components/applications/recruiter-applicants-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: job ? `Applicants for ${job.title}` : "Job Applicants",
  };
}

export default async function JobSpecificApplicantsPage({
  params,
}: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id: jobId } = await params;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingDone: true,
      companyMemberships: {
        include: { company: true },
      },
    },
  });

  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding");
  if (user.role !== UserRole.RECRUITER && user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const membership = user.companyMemberships[0];
  if (!membership) {
    redirect("/onboarding/recruiter");
  }

  const job = await db.job.findUnique({
    where: { id: jobId, companyId: membership.companyId },
    select: { id: true, title: true },
  });

  if (!job) {
    notFound();
  }

  const { applications, canUpdateStatus } = await getRecruiterApplications(
    membership.companyId,
    jobId
  );

  return (
    <div className="space-y-6">
      {/* Back to jobs */}
      <Link
        href="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job Listings
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Applicants: {job.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review candidates who applied specifically for this opening.
        </p>
      </div>

      {/* Recruiter applicants management client view */}
      <RecruiterApplicantsClient
        initialApplications={applications}
        companyId={membership.companyId}
        canUpdateStatus={canUpdateStatus}
        selectedJobId={jobId}
      />
    </div>
  );
}
