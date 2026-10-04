// src/components/jobs/job-badge.tsx
import { cn } from "@/lib/utils";
import { JobLevel, JobType } from "@prisma/client";
import { JOB_LEVEL_LABELS, JOB_TYPE_LABELS } from "@/lib/constants";

interface JobBadgeProps {
  type: "level" | "type";
  value: JobLevel | JobType;
  className?: string;
}

const LEVEL_COLORS: Record<JobLevel, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  INTERMEDIATE: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  SENIOR: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
};

const TYPE_COLORS: Record<JobType, string> = {
  FULL_TIME: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  PART_TIME: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  INTERNSHIP: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  CONTRACT: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  REMOTE: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
};

export function JobBadge({ type, value, className }: JobBadgeProps) {
  const label =
    type === "level"
      ? JOB_LEVEL_LABELS[value as JobLevel]
      : JOB_TYPE_LABELS[value as JobType];

  const color =
    type === "level"
      ? LEVEL_COLORS[value as JobLevel]
      : TYPE_COLORS[value as JobType];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        color,
        className
      )}
    >
      {label}
    </span>
  );
}
