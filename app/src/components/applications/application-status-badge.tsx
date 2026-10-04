"use client";

import { ApplicationStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Clock,
  FileSearch,
  Sparkles,
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  CornerDownLeft,
} from "lucide-react";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  icon: typeof Clock;
  classes: string;
  dotColor: string;
}

const STATUS_CONFIGS: Record<ApplicationStatus, StatusConfig> = {
  PENDING: {
    label: "Applied",
    icon: Clock,
    classes: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    dotColor: "bg-slate-500",
  },
  REVIEWED: {
    label: "Under Review",
    icon: FileSearch,
    classes: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    dotColor: "bg-sky-500",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    icon: Sparkles,
    classes: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    icon: CalendarCheck2,
    classes: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  ACCEPTED: {
    label: "Accepted 🎉",
    icon: CheckCircle2,
    classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold",
    dotColor: "bg-emerald-500",
  },
  REJECTED: {
    label: "Not Selected",
    icon: XCircle,
    classes: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    icon: CornerDownLeft,
    classes: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
    dotColor: "bg-zinc-400",
  },
};

export function ApplicationStatusBadge({
  status,
  className,
  showIcon = true,
}: ApplicationStatusBadgeProps) {
  const config = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        config.classes,
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
