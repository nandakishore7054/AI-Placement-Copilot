"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Target,
  Mic,
  BookOpen,
  Code2,
  X,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { actionRecommendation, dismissRecommendation } from "@/actions/recommendations";
import { cn } from "@/lib/utils";
import type { RecommendationType } from "@prisma/client";

interface RecommendationCardProps {
  recommendation: {
    id: string;
    type: RecommendationType;
    title: string;
    description: string;
    relevanceScore: number;
    metadata?: any;
    isActioned: boolean;
  };
  onDismissed?: (id: string) => void;
}

export function RecommendationCard({
  recommendation,
  onDismissed,
}: RecommendationCardProps) {
  const [isDismissing, startDismissTransition] = useTransition();
  const [isActioning, startActionTransition] = useTransition();
  const [hidden, setHidden] = useState(false);
  const router = useRouter();

  if (hidden) return null;

  const metadata = recommendation.metadata || {};
  const actionUrl = metadata.actionUrl || "/dashboard";
  const actionLabel = metadata.actionLabel || "Take Action";

  const typeConfig = {
    JOB: {
      label: "Job Match",
      icon: Briefcase,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      accent: "border-indigo-500/20 hover:border-indigo-500/40",
    },
    SKILL: {
      label: "Skill Gap",
      icon: Target,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      accent: "border-amber-500/20 hover:border-amber-500/40",
    },
    INTERVIEW: {
      label: "Mock Interview",
      icon: Mic,
      color: "text-violet-700 bg-violet-50 border-violet-200",
      accent: "border-violet-500/20 hover:border-violet-500/40",
    },
    COURSE: {
      label: "Learning Path",
      icon: BookOpen,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      accent: "border-emerald-500/20 hover:border-emerald-500/40",
    },
    EXPERIENCE: {
      label: "Project Milestone",
      icon: Code2,
      color: "text-sky-700 bg-sky-50 border-sky-200",
      accent: "border-sky-500/20 hover:border-sky-500/40",
    },
  }[recommendation.type] || {
    label: "Recommendation",
    icon: Sparkles,
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    accent: "border-indigo-500/20",
  };

  const TypeIcon = typeConfig.icon;
  const matchPct = Math.round(recommendation.relevanceScore * 100);

  const handleAction = () => {
    startActionTransition(async () => {
      try {
        await actionRecommendation(recommendation.id);
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHidden(true);

    startDismissTransition(async () => {
      try {
        await dismissRecommendation(recommendation.id);
        onDismissed?.(recommendation.id);
        toast.info("Recommendation dismissed.");
        router.refresh();
      } catch (e) {
        setHidden(false);
        toast.error("Failed to dismiss recommendation.");
      }
    });
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-3xl border bg-card p-5 transition-all shadow-2xs hover:shadow-xs",
        typeConfig.accent,
        recommendation.isActioned ? "opacity-75 bg-muted/20" : ""
      )}
    >
      <div>
        {/* Header with pill and dismiss button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                typeConfig.color
              )}
            >
              <TypeIcon className="h-3 w-3" />
              {typeConfig.label}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {matchPct}% Match
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            disabled={isDismissing}
            title="Dismiss recommendation"
            className="rounded-full p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 mb-1.5">
          {recommendation.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {recommendation.description}
        </p>
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-2 border-t flex items-center justify-between gap-2">
        {recommendation.isActioned ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground font-medium">
            AI Recommended
          </span>
        )}

        <Link
          href={actionUrl}
          onClick={handleAction}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors group-hover:translate-x-0.5 transition-transform"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
