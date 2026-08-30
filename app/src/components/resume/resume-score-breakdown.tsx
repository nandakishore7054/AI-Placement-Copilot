"use client";

import { Award, CheckCircle2, ShieldCheck, FileCheck2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeScoreBreakdownProps {
  overallScore: number;
  atsScore: number;
  contentScore: number;
  formatScore: number;
  className?: string;
}

export function ResumeScoreBreakdown({
  overallScore,
  atsScore,
  contentScore,
  formatScore,
  className,
}: ResumeScoreBreakdownProps) {
  const scores = [
    {
      title: "Overall Placement Score",
      score: overallScore,
      description: "Aggregate rating across all hiring criteria",
      icon: <Award className="h-5 w-5 text-indigo-600" />,
      barColor: "bg-indigo-600",
    },
    {
      title: "ATS Compatibility",
      score: atsScore,
      description: "Keyword matching and recruiter scanner readability",
      icon: <Cpu className="h-5 w-5 text-blue-600" />,
      barColor: "bg-blue-600",
    },
    {
      title: "Content & Impact",
      score: contentScore,
      description: "Metrics, quantifiable achievements, and depth",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      barColor: "bg-emerald-600",
    },
    {
      title: "Format & Structure",
      score: formatScore,
      description: "Readability, section hierarchy, and length",
      icon: <FileCheck2 className="h-5 w-5 text-purple-600" />,
      barColor: "bg-purple-600",
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {scores.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-card p-5 shadow-xs space-y-3 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60">
              {item.icon}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tracking-tight text-foreground">
                {item.score}
                <span className="text-xs font-semibold text-muted-foreground ml-0.5">/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{item.title}</span>
              <span className="font-medium text-muted-foreground">
                {item.score >= 80 ? "Excellent" : item.score >= 60 ? "Good" : "Needs Work"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full transition-all duration-500 rounded-full", item.barColor)}
                style={{ width: `${Math.min(Math.max(item.score, 0), 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-muted-foreground pt-1 leading-tight">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
