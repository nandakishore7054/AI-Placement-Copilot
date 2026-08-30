"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { analyzeResume } from "@/actions/resume";
import { cn } from "@/lib/utils";

interface AnalyzeResumeButtonProps {
  isReanalyze?: boolean;
  variant?: "primary" | "outline" | "compact";
  className?: string;
}

export function AnalyzeResumeButton({
  isReanalyze = false,
  variant = "primary",
  className,
}: AnalyzeResumeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAnalyze() {
    startTransition(async () => {
      try {
        const result = await analyzeResume();
        if (result.success) {
          toast.success(
            `Analysis complete! Overall score: ${result.analysis.overallScore}/100`
          );
          router.refresh();
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to analyze resume."
        );
      }
    });
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 cursor-pointer",
          className
        )}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isReanalyze ? (
          <RefreshCw className="h-3.5 w-3.5" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
        )}
        <span>{isPending ? "Analyzing with AI…" : isReanalyze ? "Re-Analyze" : "Run Analysis"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAnalyze}
      disabled={isPending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 cursor-pointer",
        variant === "primary"
          ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
          : "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isReanalyze ? (
        <RefreshCw className="h-4 w-4" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      <span>{isPending ? "Generating AI Insights & ATS Audit…" : isReanalyze ? "Re-Run AI Analysis" : "Run AI Resume & ATS Analysis"}</span>
    </button>
  );
}
