"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { generateFeedback } from "@/actions/feedback";

interface GenerateFeedbackButtonProps {
  interviewId: string;
  isRegenerate?: boolean;
  className?: string;
}

export function GenerateFeedbackButton({
  interviewId,
  isRegenerate = false,
  className = "",
}: GenerateFeedbackButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        toast.info(
          isRegenerate
            ? "Re-evaluating interview session with Gemini AI..."
            : "Generating comprehensive AI interview feedback...",
        );
        await generateFeedback(interviewId, isRegenerate);
        toast.success("Interview feedback generated successfully!");
        router.refresh();
        router.push(`/interviews/${interviewId}/feedback`);
      } catch (error: any) {
        console.error("[GenerateFeedbackButton] Error:", error);
        toast.error(error?.message || "Failed to generate interview feedback.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isPending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isRegenerate
          ? "border border-muted-foreground/20 bg-background hover:bg-muted text-foreground px-4 py-2"
          : "bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 shadow-sm"
      } ${className}`}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current" />
          <span>{isRegenerate ? "Re-evaluating..." : "Analyzing with AI..."}</span>
        </>
      ) : (
        <>
          {isRegenerate ? (
            <RefreshCw className="h-3.5 w-3.5" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>{isRegenerate ? "Re-evaluate Interview" : "Generate AI Evaluation"}</span>
        </>
      )}
    </button>
  );
}
