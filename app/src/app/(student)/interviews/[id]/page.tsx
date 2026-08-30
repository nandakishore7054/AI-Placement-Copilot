import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  Mic,
  Calendar,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";
import { getInterview } from "@/actions/interviews";
import { QuestionList, InterviewAgent } from "@/components/interviews";
import { formatDate, timeAgo, cn } from "@/lib/utils";
import { InterviewStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface InterviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: InterviewDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const interview = await getInterview(id);
    return {
      title: `${interview.role} Mock Interview — AI Placement Copilot`,
      description: `Structured AI mock interview for ${interview.role} with ${interview.questions.length} questions.`,
    };
  } catch {
    return {
      title: "Mock Interview — AI Placement Copilot",
    };
  }
}

export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  let interview;
  try {
    interview = await getInterview(id);
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized")) {
      redirect("/interviews");
    }
    notFound();
  }

  const isCompleted = interview.status === InterviewStatus.COMPLETED;

  const statusConfig = {
    [InterviewStatus.READY]: {
      label: "Ready to Practice",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
    [InterviewStatus.IN_PROGRESS]: {
      label: "In Progress",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    [InterviewStatus.COMPLETED]: {
      label: "Completed",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    [InterviewStatus.DRAFT]: {
      label: "Draft",
      className: "bg-slate-50 text-slate-700 border-slate-200",
      icon: <Clock className="h-3.5 w-3.5" />,
    },
  }[interview.status];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back navigation */}
      <Link
        href="/interviews"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Interviews
      </Link>

      {/* Overview Card */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
                <Mic className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {interview.role}
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Created on {formatDate(interview.createdAt)} ({timeAgo(interview.createdAt)})
                </p>
              </div>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold tracking-tight shadow-2xs self-start",
              statusConfig.className,
            )}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t">
          <div className="rounded-xl border bg-muted/20 p-3.5 space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Assessment Format
            </p>
            <p className="text-sm font-bold text-foreground capitalize">
              {interview.type.toLowerCase()}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-3.5 space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Target Level
            </p>
            <p className="text-sm font-bold text-foreground capitalize">
              {interview.level.toLowerCase()} Level
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-3.5 space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Curated Questions
            </p>
            <p className="text-sm font-bold text-indigo-600">
              {interview.questions.length} Questions
            </p>
          </div>
        </div>

        {/* Tech Stack List */}
        {interview.techStack.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-semibold text-muted-foreground">Focus Technologies & Topics:</p>
            <div className="flex flex-wrap gap-1.5">
              {interview.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Live Voice AI Interview Agent ───────────────────────────────── */}
      <InterviewAgent
        interviewId={interview.id}
        role={interview.role}
        type={interview.type}
        level={interview.level}
        techStack={interview.techStack}
        questions={interview.questions}
        initialStatus={interview.status}
        savedTranscript={interview.transcript}
        savedDuration={interview.duration}
      />

      {/* ─── Structured Questions & Guidance ─────────────────────────────── */}
      <QuestionList questions={interview.questions} />
    </div>
  );
}
