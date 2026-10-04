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
        "group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs shadow-inner-glow transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/40",
        className,
      )}
    >
      {/* Top row: company logo + title */}
      <div className="flex items-start gap-3.5">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/60 overflow-hidden shadow-2xs">
          {job.company.logoUrl ? (
            <Image
              src={job.company.logoUrl}
              alt={job.company.name}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          ) : (
            <span className="text-base font-bold text-foreground/70">
              {job.company.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {job.company.name}
            </p>
            {job.company.verified && (
              <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            )}
          </div>
          <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors leading-tight truncate">
            {job.title}
          </h3>
        </div>

        {/* Right tags: Match Score and/or Applied badge */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
          {typeof matchScore === "number" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-tight shadow-2xs border",
                matchScore >= 80
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : matchScore >= 60
                  ? "bg-primary/10 text-primary dark:text-indigo-400 border-primary/20"
                  : "bg-muted text-muted-foreground border-border",
              )}
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              {matchScore}% Match
            </span>
          )}

          {isApplied && (
            <span className="shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
          <span className="inline-flex items-center rounded-full border border-border/80 px-2.5 py-0.5 text-xs font-medium bg-muted/60 text-muted-foreground">
            {job.category}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
            {job.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
          {job._count.applications} applicant
          {job._count.applications !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
          {timeAgo(job.createdAt)}
        </span>
      </div>

      {/* Salary */}
      {job.salary && (
        <p className="text-sm font-semibold text-primary">{job.salary}</p>
      )}
    </Link>
  );
}
