// src/app/(student)/jobs/page.tsx
// Server component — reads searchParams, fetches data, renders job listing.
// All filter state lives in the URL so the page is shareable + fully SSR.

import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { JobLevel, JobType } from "@prisma/client";
import { getJobs, getUserApplicationStatuses } from "@/actions/student-jobs";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobsPagination } from "@/components/jobs/jobs-pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description: "Discover AI-matched job opportunities tailored to your skills.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    location?: string;
    level?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1"));
  const filters = {
    search: params.q,
    category: params.category,
    location: params.location,
    level: (params.level as JobLevel) || undefined,
    type: (params.type as JobType) || undefined,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const { jobs, total, totalPages } = await getJobs(filters);

  // Fetch application statuses for the current user on these jobs
  const applicationStatuses = await getUserApplicationStatuses(
    jobs.map((j) => j.id)
  );

  const hasActiveFilters = !!(
    params.q ||
    params.category ||
    params.location ||
    params.level ||
    params.type
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Jobs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {total > 0
            ? `${total} opportunit${total === 1 ? "y" : "ies"} found`
            : "No jobs found for your filters"}
        </p>
      </div>

      {/* Filters — wrapped in Suspense so the search-params read doesn't block */}
      <Suspense fallback={<div className="h-20 animate-pulse rounded-xl bg-muted" />}>
        <JobFilters />
      </Suspense>

      {/* Job grid */}
      {jobs.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applicationStatus={applicationStatuses[job.id]}
              />
            ))}
          </div>

          {/* Pagination */}
          <Suspense>
            <JobsPagination
              currentPage={page}
              totalPages={totalPages}
              total={total}
              pageSize={DEFAULT_PAGE_SIZE}
            />
          </Suspense>
        </>
      ) : (
        <EmptyState hasFilters={hasActiveFilters} />
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
        <Briefcase className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="font-semibold text-lg mb-1">
        {hasFilters ? "No matching jobs" : "No jobs yet"}
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        {hasFilters
          ? "Try broadening your search or removing some filters."
          : "Check back soon — new opportunities are added daily."}
      </p>
    </div>
  );
}
