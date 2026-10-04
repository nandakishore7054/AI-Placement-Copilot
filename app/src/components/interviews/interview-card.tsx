import Link from "next/link";
import {
  Mic,
  Calendar,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDate, timeAgo, cn } from "@/lib/utils";
import { InterviewType, JobLevel, InterviewStatus } from "@prisma/client";

export interface InterviewCardData {
  id: string;
  role: string;
  type: InterviewType;
  level: JobLevel;
  techStack: string[];
  status: InterviewStatus;
  createdAt: Date | string;
  _count?: { questions: number };
  questions?: Array<{ id: string }>;
  feedback?: { totalScore: number } | null;
}

interface InterviewCardProps {
  interview: InterviewCardData;
}

export function InterviewCard({ interview }: InterviewCardProps) {
  const questionCount = interview._count?.questions ?? interview.questions?.length ?? 0;
  const isCompleted = interview.status === InterviewStatus.COMPLETED;

  const statusConfig = {
    [InterviewStatus.READY]: {
      label: "Ready to Practice",
      className: "bg-primary/10 text-primary dark:text-indigo-400 border-primary/20",
      icon: <Sparkles className="h-3 w-3" />,
    },
    [InterviewStatus.IN_PROGRESS]: {
      label: "In Progress",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      icon: <Clock className="h-3 w-3" />,
    },
    [InterviewStatus.COMPLETED]: {
      label: "Completed",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    [InterviewStatus.DRAFT]: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-border",
      icon: <Clock className="h-3 w-3" />,
    },
  }[interview.status];

  const typeConfig = {
    [InterviewType.TECHNICAL]: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    [InterviewType.BEHAVIORAL]: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    [InterviewType.MIXED]: "bg-primary/10 text-primary dark:text-indigo-400 border-primary/20",
  }[interview.type];

  return (
    <Link
      href={`/interviews/${interview.id}`}
      className="group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs shadow-inner-glow hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">
                {interview.role}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                Created {timeAgo(interview.createdAt)}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0 shadow-2xs",
              statusConfig.className,
            )}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Level & Type Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              typeConfig,
            )}
          >
            {interview.type}
          </span>
          <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">
            {interview.level.toLowerCase()} Level
          </span>
        </div>

        {/* Tech Stack Pills */}
        {interview.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {interview.techStack.slice(0, 5).map((tech, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-muted/60 border border-border/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {interview.techStack.length > 5 && (
              <span className="inline-flex items-center rounded-md bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{interview.techStack.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta Row */}
      <div className="flex items-center justify-between border-t border-border/80 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-primary" />
            {questionCount} {questionCount === 1 ? "Question" : "Questions"}
          </span>

          {interview.feedback && (
            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <Award className="h-3.5 w-3.5" />
              Score: {interview.feedback.totalScore}/100
            </span>
          )}
        </div>

        <span className="inline-flex items-center text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
          View Overview
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </span>
      </div>
    </Link>
  );
}
