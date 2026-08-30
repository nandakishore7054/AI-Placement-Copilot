"use client";

// src/components/jobs/job-status-toggle.tsx
// Toggle a job's visibility (published / hidden) with optimistic UI.

import { useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toggleJobVisibility } from "@/actions/jobs";
import { cn } from "@/lib/utils";

interface JobStatusToggleProps {
  jobId: string;
  companyId: string;
  isVisible: boolean;
}

export function JobStatusToggle({ jobId, companyId, isVisible }: JobStatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleJobVisibility(jobId, companyId);
        toast.success(isVisible ? "Job hidden from students." : "Job is now visible to students.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update visibility.");
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isVisible ? "Click to hide" : "Click to publish"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
        isVisible
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isVisible ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {isPending ? "Updating…" : isVisible ? "Published" : "Hidden"}
    </button>
  );
}
