import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getActiveCareerRoadmap, getCareerRoadmaps, getCareerRoadmapById } from "@/actions/career";
import { getRecommendations } from "@/actions/recommendations";
import {
  CareerRoadmapView,
  GenerateRoadmapForm,
  RecommendationsSection,
} from "@/components/career";
import {
  Map,
  Target,
  Sparkles,
  TrendingUp,
  Compass,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career Roadmap & Strategy | AI Placement Copilot",
  description:
    "AI-driven milestone career roadmap, personalized recommendations, and placement guidance.",
};

interface PageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function CareerPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await searchParams;

  const [activeRoadmap, allRoadmaps, profile, latestSkillGap, recommendations] =
    await Promise.all([
      id ? getCareerRoadmapById(id) : getActiveCareerRoadmap(),
      getCareerRoadmaps(),
      db.studentProfile.findUnique({
        where: { userId },
        select: {
          skills: true,
          preferredCategories: true,
        },
      }),
      db.skillGap.findFirst({
        where: { userId },
        orderBy: { analyzedAt: "desc" },
      }),
      getRecommendations(),
    ]);

  // Determine default target role to suggest
  const defaultSuggestedRole =
    latestSkillGap?.targetRole || profile?.preferredCategories?.[0] || "";

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* ─── Top Navigation Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Career Intelligence Hub
            </h1>
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
              Phase 6
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Personalized career roadmaps, real-time recommendations, and placement diagnostics.
          </p>
        </div>

        {/* Sub-feature links */}
        <div className="flex items-center gap-2">
          <Link
            href="/skill-gap"
            className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            <Target className="h-3.5 w-3.5 text-indigo-600" />
            <span>Skill Gap Analysis</span>
          </Link>
          <Link
            href="/career/insights"
            className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span>Market Insights</span>
          </Link>
        </div>
      </div>

      {/* ─── Past Roadmaps Switcher (if more than 1) ────────────────────────── */}
      {allRoadmaps.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            Your Roadmaps:
          </span>
          {allRoadmaps.map((r) => {
            const isSelected = r.id === (activeRoadmap?.id ?? allRoadmaps[0]?.id);
            return (
              <Link
                key={r.id}
                href={`/career?id=${r.id}`}
                className={`rounded-2xl border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{r.targetRole}</span>
                <span className="ml-1.5 rounded bg-muted px-1.5 py-0.2 text-[10px] font-bold">
                  {r.progress}%
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ─── Main Roadmap View or Onboarding Form ─────────────────────────── */}
      {activeRoadmap ? (
        <div className="space-y-10">
          <CareerRoadmapView roadmap={activeRoadmap} />

          {/* Form to generate new roadmap */}
          <div className="pt-4 border-t">
            <GenerateRoadmapForm
              defaultRole={defaultSuggestedRole}
              preferredCategories={profile?.preferredCategories || []}
            />
          </div>
        </div>
      ) : (
        /* Empty / First-Time State */
        <div className="space-y-8">
          <div className="rounded-3xl border bg-card p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-3xl mx-auto">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Map className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Plan Your Placement Trajectory
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Generate an AI-powered, step-by-step career milestone plan tailored
                specifically to your current skill profile, mock interview feedback, and
                target job requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
              <div className="rounded-2xl border p-4 bg-muted/20 space-y-1.5">
                <Compass className="h-5 w-5 text-indigo-600 mb-1" />
                <h3 className="font-bold text-xs text-foreground">Level Transition</h3>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Clear sequencing from Beginner to Intermediate or Senior SDE-1 standards.
                </p>
              </div>

              <div className="rounded-2xl border p-4 bg-muted/20 space-y-1.5">
                <Target className="h-5 w-5 text-emerald-600 mb-1" />
                <h3 className="font-bold text-xs text-foreground">Portfolio Projects</h3>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Concrete full-stack and domain projects to build credible proof of work.
                </p>
              </div>

              <div className="rounded-2xl border p-4 bg-muted/20 space-y-1.5">
                <BookOpen className="h-5 w-5 text-violet-600 mb-1" />
                <h3 className="font-bold text-xs text-foreground">Interview Checkpoints</h3>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Curated interview questions and practice topics for each monthly milestone.
                </p>
              </div>
            </div>
          </div>

          <GenerateRoadmapForm
            defaultRole={defaultSuggestedRole}
            preferredCategories={profile?.preferredCategories || []}
            className="max-w-3xl mx-auto"
          />
        </div>
      )}

      {/* ─── AI Placement Recommendations Section ───────────────────────────── */}
      <div className="pt-8 border-t">
        <RecommendationsSection recommendations={recommendations} />
      </div>
    </div>
  );
}
