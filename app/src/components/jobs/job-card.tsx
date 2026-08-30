// src/components/jobs/job-card.tsx
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Clock, BadgeCheck, Sparkles } from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";
import { JobBadge } from "./job-badge";
import type { JobWithCompany } from "@/actions/student-jobs";

interface JobCardProps {
  job: JobWithCompany;
  /** If provided, renders an "Applied" badge instead of an Apply button */
  applicationStatus?: string;
  /** If provided, displays the AI semantic match score (0-100) */
  matchScore?: number;
  className?: string;
}

export function JobCard({
  job,
  applicationStatus,
  matchScore,
  className,
}: JobCardProps) {
  const isApplied = !!applicationStatus;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border bg-card p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200",
        className,
      )}
    >
      {/* Top row: company logo + title */}
      <div className="flex items-start gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted overflow-hidden">
          {job.company.logoUrl ? (
            <Image
              src={job.company.logoUrl}
              alt={job.company.name}
              fill
              className="object-contain p-1"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {job.company.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {job.company.name}
            </p>
            {job.company.verified && (
              <BadgeCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            )}
          </div>
          <h3 className="font-semibold text-base group-hover:text-indigo-600 transition-colors leading-tight truncate">
            {job.title}
          </h3>
        </div>

        {/* Right tags: Match Score and/or Applied badge */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
          {typeof matchScore === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-tight shadow-2xs",
                matchScore >= 80
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : matchScore >= 60
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-slate-50 text-slate-700 border border-slate-200",
              )}
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              {matchScore}% Match
            </span>
          )}

          {isApplied && (
            <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              Applied
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <JobBadge type="level" value={job.level} />
        <JobBadge type="type" value={job.type} />
        {job.category && (
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-slate-50 text-slate-600 border-slate-200">
            {job.category}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {job._count.applications} applicant
          {job._count.applications !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="h-3.5 w-3.5" />
          {timeAgo(job.createdAt)}
        </span>
      </div>

      {/* Salary */}
      {job.salary && (
        <p className="text-sm font-semibold text-indigo-600">{job.salary}</p>
      )}
    </Link>
  );
}
