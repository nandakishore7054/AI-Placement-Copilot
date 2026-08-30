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
  BEGINNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200",
  SENIOR: "bg-violet-50 text-violet-700 border-violet-200",
};

const TYPE_COLORS: Record<JobType, string> = {
  FULL_TIME: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PART_TIME: "bg-sky-50 text-sky-700 border-sky-200",
  INTERNSHIP: "bg-teal-50 text-teal-700 border-teal-200",
  CONTRACT: "bg-orange-50 text-orange-700 border-orange-200",
  REMOTE: "bg-purple-50 text-purple-700 border-purple-200",
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
