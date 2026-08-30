import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { getRecruiterApplications } from "@/actions/applications";
import { RecruiterApplicantsClient } from "@/components/applications/recruiter-applicants-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Applicants Management — Recruiter",
  description: "Review and manage job applicants for your company.",
};

interface PageProps {
  searchParams: Promise<{
    jobId?: string;
  }>;
}

export default async function RecruiterApplicantsPage({
  searchParams,
}: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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

  const params = await searchParams;
  const { applications, company, canUpdateStatus } =
    await getRecruiterApplications(membership.companyId, params.jobId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Applicant Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {company
            ? `Review candidates across ${company.name} job listings.`
            : "Review and evaluate candidates who applied to your open roles."}
        </p>
      </div>

      {/* Recruiter applicants management client view */}
      <RecruiterApplicantsClient
        initialApplications={applications}
        companyId={membership.companyId}
        canUpdateStatus={canUpdateStatus}
        selectedJobId={params.jobId}
      />
    </div>
  );
}
