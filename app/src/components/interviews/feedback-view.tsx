"use client";

import Link from "next/link";
import {
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowLeft,
  Clock,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
} from "lucide-react";
import { GenerateFeedbackButton } from "./generate-feedback-button";
import { formatDate, cn } from "@/lib/utils";
import type { CategoryScore, QuestionAnalysis } from "@/schemas/feedback";

interface QuestionItem {
  id: string;
  questionText: string;
  topic?: string | null;
  difficulty: string;
  orderIndex: number;
  expectedAnswer?: string | null;
}

interface FeedbackViewProps {
  interview: {
    id: string;
    role: string;
    type: string;
    level: string;
    techStack: string[];
    duration?: number | null;
    createdAt: Date;
    questions: QuestionItem[];
  };
  feedback: {
    id: string;
    totalScore: number;
    categoryScores: any;
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    questionsAnalysis: any;
    createdAt: Date;
  };
}

export function FeedbackView({ interview, feedback }: FeedbackViewProps) {
  const categoryScores = (feedback.categoryScores as CategoryScore[]) || [];
  const questionsAnalysis = (feedback.questionsAnalysis as QuestionAnalysis[]) || [];

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 70) return "text-indigo-600 border-indigo-200 bg-indigo-50";
    if (score >= 50) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-rose-600 border-rose-200 bg-rose-50";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-indigo-600";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getScoreRating = (score: number) => {
    if (score >= 85) return { label: "Exceptional / Ready", color: "text-emerald-700 bg-emerald-100" };
    if (score >= 70) return { label: "Proficient / Competitive", color: "text-indigo-700 bg-indigo-100" };
    if (score >= 50) return { label: "Developing / Promising", color: "text-amber-700 bg-amber-100" };
    return { label: "Needs Practice", color: "text-rose-700 bg-rose-100" };
  };

  const rating = getScoreRating(feedback.totalScore);

  const formatTimer = (totalSeconds: number | null | undefined) => {
    if (!totalSeconds) return "N/A";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* ─── Navigation Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href={`/interviews/${interview.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Interview Room
        </Link>

        <GenerateFeedbackButton interviewId={interview.id} isRegenerate />
      </div>

      {/* ─── Hero Overview Card with Score ─────────────────────────────────── */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI Performance Evaluation
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {interview.role} Evaluation
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(feedback.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Duration: {formatTimer(interview.duration)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  {interview.level.toLowerCase()} level • {interview.type.toLowerCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Overall Score Dial */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl border bg-muted/20 text-center shrink-0 min-w-44">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tight text-foreground">
                {feedback.totalScore}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">/100</span>
            </div>

            <span className={`inline-block mt-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${rating.color}`}>
              {rating.label}
            </span>
            <p className="text-[11px] text-muted-foreground mt-1">Overall Placement Score</p>
          </div>
        </div>
      </div>

      {/* ─── 5 Core Assessment Categories ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            Core Assessment Dimensions (5 Categories)
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
          {categoryScores.map((cat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border bg-card p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground">{cat.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold ${getScoreColor(
                      cat.score,
                    )}`}
                  >
                    {cat.score}/100
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(cat.score)}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {cat.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Strengths & Improvement Areas ───────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Key Strengths */}
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-base">Key Strengths Demonstrated</h3>
          </div>

          <ul className="space-y-2.5">
            {feedback.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-emerald-950 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="rounded-3xl border border-amber-100 bg-amber-50/40 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-800">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-base">High-Impact Growth Areas</h3>
          </div>

          <ul className="space-y-2.5">
            {feedback.areasForImprovement.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-950 leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Final Assessment Summary ─────────────────────────────────────── */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          Executive Interviewer Assessment
        </h3>
        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/20 p-4 rounded-2xl border">
          {feedback.finalAssessment}
        </p>
      </div>

      {/* ─── Question-by-Question Deep Dive ───────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-600" />
            Per-Question Detailed Analysis ({questionsAnalysis.length} Questions)
          </h2>
        </div>

        <div className="space-y-4">
          {questionsAnalysis.map((qa, idx) => {
            const originalQuestion = interview.questions.find((q) => q.id === qa.questionId);

            return (
              <div
                key={qa.questionId || idx}
                className="rounded-3xl border bg-card p-6 shadow-xs space-y-4"
              >
                {/* Question Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                        {idx + 1}
                      </span>
                      {originalQuestion?.topic && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {originalQuestion.topic}
                        </span>
                      )}
                      {originalQuestion?.difficulty && (
                        <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-muted/40">
                          {originalQuestion.difficulty}
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-sm text-foreground pt-1">
                      {originalQuestion?.questionText || `Question ${idx + 1}`}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-bold shrink-0 self-start ${getScoreColor(
                      qa.score,
                    )}`}
                  >
                    Answer Score: {qa.score}/100
                  </span>
                </div>

                {/* Candidate's Answer Excerpt */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Candidate Answer Summary:
                  </p>
                  <p className="text-xs text-foreground/90 italic bg-muted/30 p-3 rounded-xl border border-dashed">
                    &ldquo;{qa.response}&rdquo;
                  </p>
                </div>

                {/* AI Suggestion & Improvement */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-800 text-xs font-bold">
                    <Lightbulb className="h-4 w-4 text-indigo-600" />
                    How to Level Up This Answer:
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed">
                    {qa.suggestion}
                  </p>
                </div>

                {/* Benchmark Hint if present */}
                {originalQuestion?.expectedAnswer && (
                  <div className="text-[11px] text-muted-foreground border-t pt-2">
                    <span className="font-semibold text-foreground/80">Ideal Answer Benchmark: </span>
                    {originalQuestion.expectedAnswer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Footer Action Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border bg-card">
        <div>
          <p className="font-bold text-sm text-foreground">Ready to improve?</p>
          <p className="text-xs text-muted-foreground">
            Apply these recommendations in your next AI practice session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/interviews/${interview.id}`}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Review Room & Questions
          </Link>
          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Start New Practice Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
