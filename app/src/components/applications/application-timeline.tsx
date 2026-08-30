"use client";

import { ApplicationStatus } from "@prisma/client";
import {
  Check,
  Clock,
  FileSearch,
  Sparkles,
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  CornerDownLeft,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface ApplicationTimelineProps {
  status: ApplicationStatus;
  appliedAt: Date | string;
  updatedAt: Date | string;
  notes?: string | null;
}

interface Step {
  id: ApplicationStatus;
  title: string;
  description: string;
  icon: typeof Clock;
}

const STANDARD_STEPS: Step[] = [
  {
    id: ApplicationStatus.PENDING,
    title: "Application Submitted",
    description: "Your application has been received and queued for review.",
    icon: Clock,
  },
  {
    id: ApplicationStatus.REVIEWED,
    title: "Under Review",
    description: "The recruiting team is evaluating your profile and resume.",
    icon: FileSearch,
  },
  {
    id: ApplicationStatus.SHORTLISTED,
    title: "Shortlisted",
    description: "You've passed the initial review and have been shortlisted.",
    icon: Sparkles,
  },
  {
    id: ApplicationStatus.INTERVIEW_SCHEDULED,
    title: "Interview Scheduled",
    description: "An interview round has been set up with the hiring team.",
    icon: CalendarCheck2,
  },
  {
    id: ApplicationStatus.ACCEPTED,
    title: "Offer / Accepted",
    description: "Congratulations! You have been selected for the position.",
    icon: CheckCircle2,
  },
];

const STAGE_ORDER: Record<ApplicationStatus, number> = {
  PENDING: 0,
  REVIEWED: 1,
  SHORTLISTED: 2,
  INTERVIEW_SCHEDULED: 3,
  ACCEPTED: 4,
  REJECTED: -1,
  WITHDRAWN: -2,
};

export function ApplicationTimeline({
  status,
  appliedAt,
  updatedAt,
  notes,
}: ApplicationTimelineProps) {
  const currentStageIndex = STAGE_ORDER[status];
  const isTerminalNegative = status === "REJECTED" || status === "WITHDRAWN";

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4">
        <div>
          <h2 className="font-semibold text-base text-foreground">
            Application Progress
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Current stage in the hiring pipeline
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          Applied on <span className="font-medium text-foreground">{formatDate(appliedAt)}</span>
        </div>
      </div>

      {/* Special Banner for Rejected / Withdrawn */}
      {status === ApplicationStatus.WITHDRAWN && (
        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-800">
          <CornerDownLeft className="h-5 w-5 shrink-0 text-zinc-500 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Application Withdrawn</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              You withdrew this application on {formatDate(updatedAt)}. It is no longer being considered by the hiring team.
            </p>
          </div>
        </div>
      )}

      {status === ApplicationStatus.REJECTED && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <XCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Application Not Selected</h3>
            <p className="text-xs text-rose-700 leading-relaxed">
              Thank you for your interest. The company decided to move forward with other candidates for this specific opening.
            </p>
            {notes && (
              <p className="text-xs font-medium text-rose-800 pt-1 border-t border-rose-200/60 mt-2">
                Recruiter note: {notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pipeline Steps List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-muted">
        {STANDARD_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = !isTerminalNegative && index < currentStageIndex;
          const isCurrent = !isTerminalNegative && index === currentStageIndex;
          const isFuture = isTerminalNegative || index > currentStageIndex;

          return (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Step indicator node */}
              <div
                className={cn(
                  "absolute -left-6 sm:-left-8 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 transition-all bg-card",
                  isCompleted &&
                    "border-emerald-600 bg-emerald-600 text-white shadow-sm",
                  isCurrent &&
                    "border-indigo-600 bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50",
                  isFuture && "border-muted-foreground/30 text-muted-foreground/40"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Step content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={cn(
                      "text-sm font-semibold tracking-tight",
                      isCurrent && "text-indigo-600",
                      isCompleted && "text-foreground",
                      isFuture && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </h3>
                  {isCurrent && (
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      Current Stage
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
