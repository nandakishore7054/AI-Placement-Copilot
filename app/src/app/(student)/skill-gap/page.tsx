import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSkillGaps } from "@/actions/skill-gap";
import {
  SkillGapView,
  AnalyzeSkillGapForm,
  SkillGapHistory,
} from "@/components/career";
import { Sparkles, Target, Compass, Award, BarChart3, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skill Gap Analysis | AI Placement Copilot",
  description:
    "AI-driven placement calibration comparing your verified skills against employer market benchmarks.",
};

interface PageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function SkillGapPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await searchParams;

  const [skillGaps, profile] = await Promise.all([
    getSkillGaps(),
    db.studentProfile.findUnique({
      where: { userId },
      select: {
        skills: true,
        preferredCategories: true,
      },
    }),
  ]);

  const activeSkillGap = id
    ? skillGaps.find((s) => s.id === id) ?? skillGaps[0]
    : skillGaps[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Skill Gap Analysis
            </h1>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
              Phase 6
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compare your verified profile skills, resume keywords, and mock interview
            performance against current hiring benchmarks.
          </p>
        </div>
      </div>

      {/* ─── Past Analyses Selector ───────────────────────────────────────── */}
      {skillGaps.length > 1 && (
        <SkillGapHistory analyses={skillGaps} activeId={activeSkillGap?.id} />
      )}

      {/* ─── Active Analysis View or Empty State ───────────────────────────── */}
      {activeSkillGap ? (
        <div className="space-y-8">
          <SkillGapView skillGap={activeSkillGap} />

          {/* Form to calibrate another role */}
          <div className="pt-4">
            <AnalyzeSkillGapForm
              currentRole={profile?.preferredCategories?.[0] || ""}
              preferredCategories={profile?.preferredCategories || []}
            />
          </div>
        </div>
      ) : (
        /* Empty State for first-time calibration */
        <div className="space-y-8">
          <div className="rounded-3xl border bg-card p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-3xl mx-auto">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Target className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Calibrate Your Placement Readiness
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Choose any technical career role to uncover your verified strengths,
                missing skills, and an actionable roadmap to increase your interview shortlist rate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
              <div className="rounded-2xl border p-4 bg-muted/20 space-y-1.5">
                <BarChart3 className="h-5 w-5 text-indigo-600 mb-1" />
                <h3 className="font-bold text-xs text-foreground">Multi-Source Audit</h3>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Synthesizes your profile, parsed resume text, and mock interview results.
                </p>
              </div>

              <div className="rounded-2xl border p-4 bg-muted/20 space-y-1.5">
                <Compass className="h-5 w-5 text-violet-600 mb-1" />
                <h3 className="font-bold text-xs text-foreground">Competency Radar</h3>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Visual SVG radar comparison against standard role expectations (80% benchmark).
                </p>
              </div>

              <div className="rounded-2xl border p-4 bg-muted/20 space-y-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mb-1" />
                <h3 className="font-bold text-xs text-foreground">Actionable Plan</h3>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Prioritized recommendations to close critical gaps before placements.
                </p>
              </div>
            </div>
          </div>

          <AnalyzeSkillGapForm
            currentRole={profile?.preferredCategories?.[0] || ""}
            preferredCategories={profile?.preferredCategories || []}
            className="max-w-3xl mx-auto"
          />
        </div>
      )}
    </div>
  );
}
