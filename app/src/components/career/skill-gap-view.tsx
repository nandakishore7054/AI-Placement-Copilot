"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Target,
  Calendar,
  BookOpen,
  Mic,
  Lightbulb,
} from "lucide-react";
import { SkillGapChart } from "./skill-gap-chart";
import { formatDate, cn } from "@/lib/utils";
import type { SkillDetail } from "@/schemas/skill-gap";

interface SkillGapViewProps {
  skillGap: {
    id: string;
    targetRole: string;
    currentSkills: string[];
    requiredSkills: string[];
    missingSkills: string[];
    matchPercentage: number;
    recommendations: string[];
    proficiencyMap: any;
    analyzedAt: Date | string;
  };
}

export function SkillGapView({ skillGap }: SkillGapViewProps) {
  const [filter, setFilter] = useState<"ALL" | "MISSING" | "IMPROVING" | "ACQUIRED">("ALL");

  // Extract structured proficiency data
  const mapData = skillGap.proficiencyMap || {};
  const skillDetails: SkillDetail[] =
    mapData.details ||
    skillGap.requiredSkills.map((name) => {
      const score = mapData.scores?.[name] ?? mapData[name] ?? 0;
      const status = score >= 70 ? "ACQUIRED" : score >= 35 ? "IMPROVING" : "MISSING";
      return {
        skill: name,
        score,
        status,
        priority: "IMPORTANT",
        evidence: score > 0 ? "Detected in Profile/Resume" : "Market Requirement",
      };
    });

  const summaryText =
    mapData.summary ||
    `You are currently at a ${skillGap.matchPercentage}% match for the ${skillGap.targetRole} role. Closing key critical gaps will significantly increase your interview shortlist rate.`;

  const filteredSkills = skillDetails.filter((s) => {
    if (filter === "ALL") return true;
    return s.status === filter;
  });

  const acquiredCount = skillDetails.filter((s) => s.status === "ACQUIRED").length;
  const improvingCount = skillDetails.filter((s) => s.status === "IMPROVING").length;
  const missingCount = skillDetails.filter((s) => s.status === "MISSING").length;

  const getMatchTier = (pct: number) => {
    if (pct >= 80) return { label: "Placement Ready", color: "text-emerald-700 bg-emerald-100 border-emerald-200" };
    if (pct >= 60) return { label: "Near Target", color: "text-indigo-700 bg-indigo-100 border-indigo-200" };
    if (pct >= 40) return { label: "Developing", color: "text-amber-700 bg-amber-100 border-amber-200" };
    return { label: "Foundational", color: "text-rose-700 bg-rose-100 border-rose-200" };
  };

  const matchTier = getMatchTier(skillGap.matchPercentage);

  return (
    <div className="space-y-8">
      {/* ─── Hero Overview Card ────────────────────────────────────────────── */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              Role Calibration Analysis
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {skillGap.targetRole}
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Analyzed on {formatDate(skillGap.analyzedAt)}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {summaryText}
            </p>
          </div>

          {/* Match Percentage Dial */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl border bg-muted/20 text-center shrink-0 min-w-52">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tight text-foreground">
                {skillGap.matchPercentage}%
              </span>
            </div>
            <span
              className={cn(
                "inline-block mt-2 rounded-full border px-3 py-0.5 text-xs font-bold shadow-2xs",
                matchTier.color
              )}
            >
              {matchTier.label}
            </span>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Placement Readiness Match
            </p>
          </div>
        </div>

        {/* Quick Stat Tiles */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t">
          <div className="rounded-2xl border bg-emerald-50/50 border-emerald-100 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Acquired
            </span>
            <p className="text-xl font-black text-emerald-950">{acquiredCount}</p>
          </div>

          <div className="rounded-2xl border bg-indigo-50/50 border-indigo-100 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
              Improving
            </span>
            <p className="text-xl font-black text-indigo-950">{improvingCount}</p>
          </div>

          <div className="rounded-2xl border bg-rose-50/50 border-rose-100 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
              Missing Gaps
            </span>
            <p className="text-xl font-black text-rose-950">{missingCount}</p>
          </div>
        </div>
      </div>

      {/* ─── Visual Competency Radar Matrix ────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 rounded-3xl border bg-card p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            <h2 className="font-bold text-sm text-foreground">
              Core Competency Radar
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Visual comparison of your demonstrated skills against the expected 80% role benchmark.
          </p>

          <SkillGapChart
            skills={skillDetails.map((s) => ({
              skill: s.skill,
              score: s.score,
              status: s.status,
            }))}
          />
        </div>

        {/* Actionable Next Steps / Strategic Recommendations */}
        <div className="lg:col-span-7 rounded-3xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h2 className="font-bold text-sm text-foreground">
              Strategic Placement Recommendations
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Actionable milestones to close critical gaps and qualify for higher shortlist bands:
          </p>

          <ul className="space-y-3">
            {skillGap.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl border bg-muted/20 p-3.5 text-xs text-foreground/90 leading-relaxed"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 mt-0.5">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Detailed Skills Breakdown Matrix ──────────────────────────────── */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Comprehensive Skills Matrix
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Breakdown of skills evaluated for {skillGap.targetRole} with evidence and recommendations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border">
            {(
              [
                { id: "ALL", label: `All (${skillDetails.length})` },
                { id: "MISSING", label: `Missing (${missingCount})` },
                { id: "IMPROVING", label: `Improving (${improvingCount})` },
                { id: "ACQUIRED", label: `Acquired (${acquiredCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer",
                  filter === tab.id
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skills List Table / Cards */}
        <div className="space-y-3">
          {filteredSkills.map((item, idx) => {
            const isMissing = item.status === "MISSING";
            const isImproving = item.status === "IMPROVING";

            const priorityBadge = {
              CRITICAL: "bg-rose-50 text-rose-700 border-rose-200",
              IMPORTANT: "bg-amber-50 text-amber-700 border-amber-200",
              NICE_TO_HAVE: "bg-slate-50 text-slate-700 border-slate-200",
            }[item.priority];

            const statusBadge = {
              ACQUIRED: "bg-emerald-50 text-emerald-700 border-emerald-200",
              IMPROVING: "bg-indigo-50 text-indigo-700 border-indigo-200",
              MISSING: "bg-rose-50 text-rose-700 border-rose-200",
            }[item.status];

            const progressColor = isMissing
              ? "bg-rose-500"
              : isImproving
              ? "bg-indigo-600"
              : "bg-emerald-500";

            return (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl border p-4 sm:p-5 transition-all space-y-3",
                  isMissing ? "bg-rose-50/20 border-rose-100" : "bg-card"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {item.skill}
                    </span>
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        statusBadge
                      )}
                    >
                      {item.status}
                    </span>
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        priorityBadge
                      )}
                    >
                      {item.priority.replace("_", " ")}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-foreground">
                    Proficiency: {item.score}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", progressColor)}
                    style={{ width: `${Math.max(item.score, 4)}%` }}
                  />
                </div>

                {/* Evidence & Recommendation */}
                <div className="grid gap-2 sm:grid-cols-2 text-xs pt-1">
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Source Evidence: </span>
                    {item.evidence}
                  </div>

                  {item.recommendation && (
                    <div className="text-indigo-900 bg-indigo-50/40 rounded-lg p-2 border border-indigo-100/50">
                      <span className="font-semibold text-indigo-700">Action Plan: </span>
                      {item.recommendation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Footer Action Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border bg-card">
        <div>
          <p className="font-bold text-sm text-foreground">
            Ready to test your readiness?
          </p>
          <p className="text-xs text-muted-foreground">
            Conduct a mock voice interview targeting {skillGap.targetRole} to calibrate under real pressure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Explore Matching Jobs
          </Link>
          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            <Mic className="h-3.5 w-3.5" />
            Start Mock Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
