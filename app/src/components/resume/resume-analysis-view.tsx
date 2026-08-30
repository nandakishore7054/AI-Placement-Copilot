"use client";

import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Tag,
  PlusCircle,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import { AtsScoreBadge } from "./ats-score-badge";
import { AnalyzeResumeButton } from "./analyze-resume-button";
import { ResumeScoreBreakdown } from "./resume-score-breakdown";
import { formatDate, timeAgo } from "@/lib/utils";

export interface ResumeAnalysisData {
  id: string;
  overallScore: number;
  formatScore: number;
  contentScore: number;
  atsScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestions: string[];
  sectionScores: Record<string, number> | any;
  strengths: string[];
  weaknesses: string[];
  analyzedAt: Date | string;
}

interface ResumeAnalysisViewProps {
  analysis: ResumeAnalysisData;
}

export function ResumeAnalysisView({ analysis }: ResumeAnalysisViewProps) {
  const sectionScores =
    typeof analysis.sectionScores === "object" && analysis.sectionScores !== null
      ? (analysis.sectionScores as Record<string, number>)
      : {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                AI Placement & ATS Evaluation
              </h2>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last analyzed on {formatDate(analysis.analyzedAt)} ({timeAgo(analysis.analyzedAt)})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AtsScoreBadge score={analysis.atsScore} size="lg" />
            <AnalyzeResumeButton isReanalyze variant="compact" />
          </div>
        </div>

        {/* 4-Card Score Breakdown */}
        <ResumeScoreBreakdown
          overallScore={analysis.overallScore}
          atsScore={analysis.atsScore}
          contentScore={analysis.contentScore}
          formatScore={analysis.formatScore}
        />
      </div>

      {/* Section-Level Performance */}
      {Object.keys(sectionScores).length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            Section-by-Section Quality Ratings
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(sectionScores).map(([section, score]) => {
              const numScore = Number(score) || 0;
              return (
                <div
                  key={section}
                  className="rounded-xl border bg-muted/20 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground capitalize">
                      {section}
                    </span>
                    <span className="font-bold text-indigo-600">{numScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(Math.max(numScore, 0), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-base text-foreground">Top Profile Strengths</h3>
          </div>

          <div className="space-y-2.5">
            {analysis.strengths.map((strength, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs text-emerald-900 leading-relaxed"
              >
                <span className="font-bold text-emerald-600 shrink-0">#{i + 1}</span>
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses / Gaps */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-base text-foreground">Areas for Enhancement</h3>
          </div>

          <div className="space-y-2.5">
            {analysis.weaknesses.map((weakness, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/40 p-3 text-xs text-amber-900 leading-relaxed"
              >
                <span className="font-bold text-amber-600 shrink-0">#{i + 1}</span>
                <span>{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyword Intelligence */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Keywords Found */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-foreground">
              Detected Skills & Keywords ({analysis.keywordsFound.length})
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Competencies successfully extracted from your resume content.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {analysis.keywordsFound.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Keywords Missing */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-purple-500" />
            <h3 className="font-bold text-sm text-foreground">
              Recommended Placement Keywords ({analysis.keywordsMissing.length})
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            High-demand keywords relevant to your domain that recruiters frequently filter by.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {analysis.keywordsMissing.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700"
              >
                + {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-base text-foreground">
            Actionable Optimization Recommendations
          </h3>
        </div>

        <div className="space-y-3">
          {analysis.suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4 text-xs text-foreground leading-relaxed"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                {i + 1}
              </div>
              <p className="pt-0.5">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
