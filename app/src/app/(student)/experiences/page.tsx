import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Award, Briefcase } from "lucide-react";
import { JobLevel } from "@prisma/client";
import { getExperiences, getCompaniesList } from "@/actions/experiences";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { ExperienceFilters } from "@/components/experiences/experience-filters";
import { ShareExperienceDialog } from "@/components/experiences/share-experience-dialog";
import { Button } from "@/components/ui/button";
import { JobsPagination } from "@/components/jobs/jobs-pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Placement & Interview Experiences",
  description: "Explore verified interview questions, hiring rounds, and placement advice from top companies.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    level?: string;
    page?: string;
  }>;
}

export default async function ExperiencesPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));

  const [{ experiences, total, totalPages }, companies] = await Promise.all([
    getExperiences({
      search: params.q,
      category: params.category,
      level: (params.level as JobLevel) || undefined,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    getCompaniesList(),
  ]);

  const hasActiveFilters = !!(params.q || params.category || params.level);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Interview & Placement Experiences
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {total > 0
              ? `Explore ${total} verified hiring experience${
                  total === 1 ? "" : "s"
                } and preparation insights.`
              : "Browse real interview processes and tips from peers and recruiters."}
          </p>
        </div>

        <ShareExperienceDialog companies={companies} />
      </div>

      {/* Filters */}
      <Suspense
        fallback={<div className="h-12 animate-pulse rounded-xl bg-muted" />}
      >
        <ExperienceFilters />
      </Suspense>

      {/* Experience Grid */}
      {experiences.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
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
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 py-16 px-4 text-center shadow-inner-glow">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 ring-8 ring-indigo-500/5 mb-4">
            <Award className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-1.5">
            {hasActiveFilters
              ? "No matching experiences found"
              : "No experiences shared yet"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-4">
            {hasActiveFilters
              ? "Try adjusting your search keywords or clearing some filters to explore more."
              : "Be the leader in your batch! Share your recent interview rounds and help peers succeed."}
          </p>
          <ShareExperienceDialog
            companies={companies}
            trigger={
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs">
                {hasActiveFilters ? "Share An Experience" : "Be the First to Share"}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
