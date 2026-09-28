"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  Mic,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Target,
  Trash2,
  Loader2,
  TrendingUp,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { updateRoadmapProgress, deleteCareerRoadmap } from "@/actions/career";
import { formatDate, cn } from "@/lib/utils";
import type { RoadmapMilestone, RoadmapResource } from "@/schemas/career";

interface CareerRoadmapViewProps {
  roadmap: {
    id: string;
    targetRole: string;
    currentLevel: string;
    targetLevel: string;
    timelineMonths: number;
    milestones: any;
    skillsToAcquire: string[];
    resources?: any;
    progress: number;
    generatedAt: Date | string;
  };
}

export function CareerRoadmapView({ roadmap }: CareerRoadmapViewProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const rawMilestones = (
    Array.isArray(roadmap.milestones) ? roadmap.milestones : []
  ) as RoadmapMilestone[];

  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(rawMilestones);
  const [progress, setProgress] = useState(roadmap.progress);

  const rawResources = (
    Array.isArray(roadmap.resources) ? roadmap.resources : []
  ) as RoadmapResource[];

  const handleToggleMilestone = (index: number) => {
    const target = milestones[index];
    if (!target) return;

    const nextCompleted = !target.completed;
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = { ...target, completed: nextCompleted };

    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const nextProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    // Optimistic update
    setMilestones(updatedMilestones);
    setProgress(nextProgress);

    startTransition(async () => {
      try {
        const res = await updateRoadmapProgress(roadmap.id, index, nextCompleted);
        if (res.success) {
          toast.success(
            nextCompleted
              ? `Milestone ${index + 1} marked complete! (${nextProgress}%)`
              : `Milestone ${index + 1} marked incomplete.`,
          );
          router.refresh();
        } else {
          // Rollback on failure
          setMilestones(rawMilestones);
          setProgress(roadmap.progress);
          toast.error(res.error || "Failed to update milestone.");
        }
      } catch (err: any) {
        setMilestones(rawMilestones);
        setProgress(roadmap.progress);
        toast.error("Failed to update milestone.");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this career roadmap?")) return;

    startTransition(async () => {
      try {
        const res = await deleteCareerRoadmap(roadmap.id);
        if (res.success) {
          toast.success("Roadmap deleted.");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to delete roadmap.");
        }
      } catch (err) {
        toast.error("Failed to delete roadmap.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ─── Hero Overview Card ────────────────────────────────────────────── */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              Active Placement Roadmap
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {roadmap.targetRole}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold">
                    {roadmap.currentLevel}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="rounded-md bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[11px] font-bold">
                    {roadmap.targetLevel}
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {roadmap.timelineMonths} Months Timeline
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Generated {formatDate(roadmap.generatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress dial & delete */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
            <div className="p-4 rounded-2xl border bg-muted/20 text-center min-w-44">
              <p className="text-3xl font-black text-foreground">{progress}%</p>
              <div className="h-2 w-full rounded-full bg-muted mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${Math.max(progress, 3)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                Roadmap Completion
              </p>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-600 transition-colors p-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Roadmap</span>
            </button>
          </div>
        </div>

        {/* Priority Skills to Acquire */}
        {roadmap.skillsToAcquire.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-indigo-600" />
              Key Target Skills to Acquire
            </span>
            <div className="flex flex-wrap gap-1.5">
              {roadmap.skillsToAcquire.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border bg-indigo-50/70 border-indigo-100 text-indigo-800 px-2.5 py-1 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Sequential Milestone Tracker ───────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Sequential Milestone Phases
            </h2>
            <p className="text-xs text-muted-foreground">
              Check off completed milestones to update your placement readiness progress.
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {milestones.filter((m) => m.completed).length} / {milestones.length} Completed
          </span>
        </div>

        <div className="space-y-4">
          {milestones.map((m, idx) => {
            const isCompleted = m.completed;

            return (
              <div
                key={idx}
                className={cn(
                  "rounded-3xl border p-5 sm:p-6 transition-all space-y-4 shadow-2xs",
                  isCompleted
                    ? "bg-emerald-50/20 border-emerald-200"
                    : "bg-card border-border hover:border-indigo-200"
                )}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleMilestone(idx)}
                      disabled={isPending}
                      className="mt-0.5 cursor-pointer text-foreground hover:scale-110 transition-transform disabled:opacity-50"
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-indigo-600" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                          Month {m.month}
                        </span>
                        <h3
                          className={cn(
                            "font-bold text-sm sm:text-base text-foreground",
                            isCompleted ? "line-through text-muted-foreground" : ""
                          )}
                        >
                          {m.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0",
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? "Completed" : "In Progress"}
                  </span>
                </div>

                {/* Subsections: Action Items, Projects, Interview Prep */}
                <div className="grid gap-3 sm:grid-cols-3 pt-2 text-xs">
                  {/* Action Items */}
                  {m.actionItems && m.actionItems.length > 0 && (
                    <div className="rounded-2xl border bg-muted/20 p-3 space-y-1.5">
                      <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                        Action Items
                      </span>
                      <ul className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                        {m.actionItems.map((item, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Portfolio Project */}
                  {m.projects && m.projects.length > 0 && (
                    <div className="rounded-2xl border bg-muted/20 p-3 space-y-1.5">
                      <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-emerald-600" />
                        Practical Project
                      </span>
                      <ul className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                        {m.projects.map((proj, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600">→</span>
                            <span className="font-medium text-foreground/90">{proj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interview Topics */}
                  {m.interviewPrep && m.interviewPrep.length > 0 && (
                    <div className="rounded-2xl border bg-muted/20 p-3 space-y-1.5">
                      <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-violet-600" />
                        Interview Prep
                      </span>
                      <ul className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                        {m.interviewPrep.map((topic, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-1.5">
                            <span className="text-violet-600">★</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Skills tags */}
                {m.skills && m.skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Focus:
                    </span>
                    {m.skills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Curated Learning Resources ────────────────────────────────────── */}
      {rawResources.length > 0 && (
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-base text-foreground">
              Curated Learning Resources
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended courses, tutorials, docs, and interview repositories aligned with this roadmap.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {rawResources.map((res, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-muted/20 p-4 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {res.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-foreground mt-1">{res.title}</h4>
                  {res.description && (
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {res.description}
                    </p>
                  )}
                </div>

                {res.url && (
                  <a
                    href={res.url.startsWith("http") ? res.url : `https://${res.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors mt-2"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Footer Action Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border bg-card">
        <div>
          <p className="font-bold text-sm text-foreground">
            Test Your Knowledge with Voice AI
          </p>
          <p className="text-xs text-muted-foreground">
            Run a simulated technical interview on the current milestone concepts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/skill-gap"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Review Skill Gaps
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
