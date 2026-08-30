"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Briefcase } from "lucide-react";

export default function RecruiterApplicantsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RecruiterApplicantsError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-foreground mb-1.5">
        Unable to load applicants
      </h2>

      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        Something went wrong while retrieving candidate records for your company. Please try refreshing or return to job listings.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-2 rounded-xl border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted active:scale-95 transition-all"
        >
          <Briefcase className="h-4 w-4" />
          Manage Jobs
        </Link>
      </div>
    </div>
  );
}
