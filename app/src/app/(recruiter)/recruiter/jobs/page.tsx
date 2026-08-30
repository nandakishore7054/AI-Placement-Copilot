// src/app/(recruiter)/recruiter/jobs/page.tsx
// Recruiter job management listing — shows all company jobs with
// status toggle, edit link, and delete dialog.

import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { Plus, Briefcase, Users, Clock } from "lucide-react";
import { JobBadge } from "@/components/jobs/job-badge";
import { JobStatusToggle } from "@/components/jobs/job-status-toggle";
import { DeleteJobDialog } from "@/components/jobs/delete-job-dialog";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Jobs — Recruiter",
};

export default async function RecruiterJobsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingDone: true,
      companyMemberships: {
        include: {
          company: {
            include: {
              jobs: {
                include: {
                  _count: { select: { applications: true } },
                },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!user) redirect("/sign-in");
  if (!user.onboardingDone) redirect("/onboarding");
  if (user.role !== UserRole.RECRUITER && user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  const membership = user.companyMemberships[0];
  const company = membership?.company ?? null;
  const jobs = company?.jobs ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Listings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {company
              ? `${jobs.length} job${jobs.length !== 1 ? "s" : ""} for ${company.name}`
              : "Set up your company to post jobs"}
          </p>
        </div>
        {company && (
          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post Job
          </Link>
        )}
      </div>

      {/* No company state */}
      {!company && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="font-semibold text-lg mb-1">No company yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create your company profile before posting jobs.
          </p>
          <Link
            href="/onboarding/recruiter"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Create Company
          </Link>
        </div>
      )}

      {/* Empty jobs state */}
      {company && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="font-semibold text-lg mb-1">No jobs yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Post your first job listing to start receiving applications.
          </p>
          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post Your First Job
          </Link>
        </div>
      )}

      {/* Job list */}
      {company && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border bg-card p-5 space-y-4 hover:shadow-sm transition-shadow"
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{job.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.location} · {job.category}
                  </p>
                </div>
                {/* Status toggle */}
                <JobStatusToggle
                  jobId={job.id}
                  companyId={company.id}
                  isVisible={job.isVisible}
                />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <JobBadge type="level" value={job.level} />
                <JobBadge type="type" value={job.type} />
                {job.salary && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
                    {job.salary}
                  </span>
                )}
              </div>

              {/* Meta + Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Posted {timeAgo(job.createdAt)}
                </span>

                {/* Action buttons */}
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Link
                    href={`/recruiter/applicants?jobId=${job.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Applicants ({job._count.applications})</span>
                  </Link>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                    target="_blank"
                  >
                    Preview ↗
                  </Link>
                  <Link
                    href={`/recruiter/jobs/${job.id}/edit`}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteJobDialog
                    jobId={job.id}
                    companyId={company.id}
                    jobTitle={job.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
