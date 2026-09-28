"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Map, ArrowRight } from "lucide-react";
import { JobLevel } from "@prisma/client";
import { toast } from "sonner";
import { generateCareerRoadmap } from "@/actions/career";
import { cn } from "@/lib/utils";

interface GenerateRoadmapFormProps {
  defaultRole?: string;
  preferredCategories?: string[];
  className?: string;
}

export function GenerateRoadmapForm({
  defaultRole = "",
  preferredCategories = [],
  className = "",
}: GenerateRoadmapFormProps) {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [currentLevel, setCurrentLevel] = useState<JobLevel>(JobLevel.BEGINNER);
  const [targetLevel, setTargetLevel] = useState<JobLevel>(JobLevel.INTERMEDIATE);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const suggestedRoles = Array.from(
    new Set([
      ...preferredCategories,
      "Frontend Engineer",
      "Full Stack Developer",
      "Backend Engineer",
      "DevOps Engineer",
      "Machine Learning Engineer",
    ]),
  ).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRole = targetRole.trim();
    if (!cleanRole) {
      toast.error("Please enter a target role.");
      return;
    }

    startTransition(async () => {
      try {
        toast.info(`Generating personalized career roadmap for ${cleanRole}...`);
        const res = await generateCareerRoadmap({
          targetRole: cleanRole,
          currentLevel,
          targetLevel,
        });

        if (!res.success) {
          toast.error(res.error || "Failed to generate career roadmap. Please try again.");
          return;
        }

        toast.success(`Career roadmap for ${cleanRole} is ready!`);
        router.refresh();
      } catch (err: any) {
        console.error("[GenerateRoadmapForm] Error:", err);
        toast.error("An error occurred while generating roadmap.");
      }
    });
  };

  return (
    <div className={cn("rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-6", className)}>
      <div className="flex items-center gap-2">
        <Map className="h-5 w-5 text-indigo-600" />
        <h2 className="font-bold text-base text-foreground">
          Generate New Career Roadmap
        </h2>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
        Our AI combines your profile skills, uploaded resume keywords, verified mock interview
        scores, and live placement market requirements into a sequential, actionable milestone plan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Input */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Target Career Role
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Full Stack Developer, SDE-1, Cloud Engineer..."
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
        </div>

        {/* Level Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Current Experience Level
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as JobLevel)}
              disabled={isPending}
              className="w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
            >
              <option value={JobLevel.BEGINNER}>Beginner (Fresher / Student)</option>
              <option value={JobLevel.INTERMEDIATE}>Intermediate (1-3 Years / Projects)</option>
              <option value={JobLevel.SENIOR}>Senior (Production Experience)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Target Experience Level
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value as JobLevel)}
              disabled={isPending}
              className="w-full rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
            >
              <option value={JobLevel.BEGINNER}>Beginner (Campus Placements)</option>
              <option value={JobLevel.INTERMEDIATE}>Intermediate (SDE-1 / Product Role)</option>
              <option value={JobLevel.SENIOR}>Senior (Specialist / Lead)</option>
            </select>
          </div>
        </div>

        {/* Quick Role Suggestions */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Suggested Roles:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setTargetRole(role)}
                disabled={isPending}
                className="rounded-lg border bg-muted/30 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-2.5 py-1 text-[11px] font-medium text-foreground transition-all cursor-pointer disabled:opacity-50"
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !targetRole.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Synthesizing Tailored Roadmap...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Roadmap</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
