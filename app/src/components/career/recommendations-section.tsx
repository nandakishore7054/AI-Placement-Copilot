"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { refreshRecommendations } from "@/actions/recommendations";
import { RecommendationCard } from "./recommendation-card";
import { cn } from "@/lib/utils";

interface RecommendationsSectionProps {
  recommendations: any[];
  title?: string;
  description?: string;
  className?: string;
}

export function RecommendationsSection({
  recommendations = [],
  title = "AI Placement Recommendations",
  description = "Context-aware action items dynamically formulated from your resume, skill gaps, and interview scores.",
  className = "",
}: RecommendationsSectionProps) {
  const [isRefreshing, startRefreshTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    startRefreshTransition(async () => {
      try {
        toast.info("Synthesizing updated AI recommendations...");
        const res = await refreshRecommendations();
        if (res.success) {
          toast.success(`Generated ${res.count ?? "new"} recommendations!`);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to refresh recommendations.");
        }
      } catch (err) {
        toast.error("An error occurred while refreshing recommendations.");
      }
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {title}
            </h2>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              Live AI
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh AI</span>
            </>
          )}
        </button>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border bg-card p-8 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-foreground">
              No Active Recommendations
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Click below to let our AI evaluate your active profile, mock interviews, and skill gaps to produce personalized placement guidance.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Recommendations...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Recommendations</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
