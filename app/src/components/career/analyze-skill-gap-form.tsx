"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Target, Search } from "lucide-react";
import { toast } from "sonner";
import { analyzeSkillGap } from "@/actions/skill-gap";

interface AnalyzeSkillGapFormProps {
  currentRole?: string;
  preferredCategories?: string[];
  className?: string;
}

const DEFAULT_POPULAR_ROLES = [
  "Frontend Engineer",
  "Full Stack Developer",
  "Backend Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Cloud Solutions Architect",
];

export function AnalyzeSkillGapForm({
  currentRole = "",
  preferredCategories = [],
  className = "",
}: AnalyzeSkillGapFormProps) {
  const [targetRole, setTargetRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Combine preferred categories with popular roles
  const suggestedRoles = Array.from(
    new Set([...preferredCategories, ...DEFAULT_POPULAR_ROLES]),
  ).slice(0, 6);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRole = targetRole.trim();
    if (!cleanRole) {
      toast.error("Please enter or select a target role to analyze.");
      return;
    }

    startTransition(async () => {
      try {
        toast.info(`Calibrating profile against ${cleanRole} market benchmarks...`);
        const result = await analyzeSkillGap(cleanRole);

        if (!result.success) {
          toast.error(
            result.error ||
              "Skill gap analysis is temporarily unavailable. Please try again in a moment.",
          );
          return;
        }

        toast.success(`Skill gap analysis for ${cleanRole} complete!`);
        router.refresh();
      } catch (err: any) {
        console.error("[AnalyzeSkillGapForm] Error:", err);
        toast.error("An error occurred during analysis. Please try again.");
      }
    });
  };

  const handleChipClick = (role: string) => {
    setTargetRole(role);
    startTransition(async () => {
      try {
        toast.info(`Calibrating profile against ${role} market benchmarks...`);
        const result = await analyzeSkillGap(role);

        if (!result.success) {
          toast.error(
            result.error ||
              "Skill gap analysis is temporarily unavailable. Please try again in a moment.",
          );
          return;
        }

        toast.success(`Skill gap analysis for ${role} complete!`);
        router.refresh();
      } catch (err: any) {
        console.error("[AnalyzeSkillGapForm] Chip Error:", err);
        toast.error("An error occurred during analysis. Please try again.");
      }
    });
  };

  return (
    <div className={`rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-5 ${className}`}>
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-indigo-600" />
        <h2 className="font-bold text-base text-foreground">
          Calibrate New Career Target Role
        </h2>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
        Enter your desired job title or select from trending campus roles. Our AI automatically
        evaluates your Profile skills, uploaded Resume, and Mock Interview history against real industry requirements.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Senior Frontend Engineer, ML Engineer, DevOps..."
            className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !targetRole.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing Market Benchmarks...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Analyze Skill Gap</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Chips */}
      <div className="space-y-2 pt-1 border-t">
        <span className="text-[11px] font-semibold text-muted-foreground">
          Popular Target Roles:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleChipClick(role)}
              disabled={isPending}
              className="rounded-lg border bg-muted/30 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-2.5 py-1 text-[11px] font-medium text-foreground transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
