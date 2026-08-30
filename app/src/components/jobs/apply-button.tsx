"use client";

// src/components/jobs/apply-button.tsx
// Client component — calls applyToJob server action with optimistic UI feedback.

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { applyToJob } from "@/actions/student-jobs";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { ApplicationStatus } from "@prisma/client";

interface ApplyButtonProps {
  jobId: string;
  /** Status string if already applied (e.g. "PENDING") */
  existingStatus?: string;
  /** External apply link — use instead of internal action if set */
  applyLink?: string | null;
  className?: string;
}

export function ApplyButton({
  jobId,
  existingStatus,
  applyLink,
  className,
}: ApplyButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<string | undefined>(
    existingStatus
  );

  const isApplied = !!localStatus;

  function handleApply() {
    if (applyLink) {
      window.open(applyLink, "_blank", "noopener noreferrer");
      return;
    }

    startTransition(async () => {
      const result = await applyToJob(jobId);
      if (result.success) {
        setLocalStatus("PENDING");
        toast.success("Application submitted! 🎉");
      } else if (result.alreadyApplied) {
        toast.info("You've already applied to this job.");
        setLocalStatus("PENDING");
      } else {
        toast.error(result.error ?? "Failed to apply. Please try again.");
      }
    });
  }

  if (isApplied) {
    const label =
      APPLICATION_STATUS_LABELS[localStatus as ApplicationStatus] ?? "Applied";
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default",
          className
        )}
      >
        ✓ {label}
      </span>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={isPending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all",
        "bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      {isPending ? "Applying…" : applyLink ? "Apply Externally ↗" : "Apply Now"}
    </button>
  );
}
