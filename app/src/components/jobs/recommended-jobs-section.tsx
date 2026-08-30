import Link from "next/link";
import { Sparkles, FileText, ArrowRight, Briefcase } from "lucide-react";
import { getRecommendedJobs } from "@/actions/student-jobs";
import { JobCard } from "./job-card";

interface RecommendedJobsSectionProps {
  limit?: number;
  showViewAll?: boolean;
}

export async function RecommendedJobsSection({
  limit = 6,
  showViewAll = true,
}: RecommendedJobsSectionProps) {
  const result = await getRecommendedJobs(limit);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight text-foreground">
              Recommended for You
            </h2>
            <p className="text-xs text-muted-foreground">
              Personalized semantic matches based on your verified resume profile
            </p>
          </div>
        </div>

        {showViewAll && (
          <Link
            href="/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            Browse all jobs
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Content based on Recommendation Status */}
      {result.status === "NO_RESUME" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50/70 via-indigo-50/30 to-background">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Upload your resume to unlock AI job matching
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
                Our pgvector semantic matching engine calculates real-time similarity scores between your resume competencies and active recruiter listings.
              </p>
            </div>
          </div>

          <Link
            href="/resume"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
          >
            Upload Resume
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {result.status === "NO_EMBEDDING" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-amber-200 bg-amber-50/60">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-950">
                AI Profile Analysis Pending
              </p>
              <p className="text-xs text-amber-800 mt-0.5 max-w-xl leading-relaxed">
                Run AI analysis on your uploaded resume to generate your semantic profile vector and unlock instant placement matching.
              </p>
            </div>
          </div>

          <Link
            href="/resume"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors shadow-2xs"
          >
            Run AI Analysis
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {result.status === "NO_JOBS" && (
        <div className="p-8 rounded-2xl border bg-card text-center space-y-3">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              No matching openings currently found
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Recruiters are frequently adding new positions. Explore all available openings or refine your resume skills.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            View all current job listings →
          </Link>
        </div>
      )}

      {result.status === "SUCCESS" && result.jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.jobs.map(({ job, matchScore, applicationStatus }) => (
            <JobCard
              key={job.id}
              job={job}
              matchScore={matchScore}
              applicationStatus={applicationStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
