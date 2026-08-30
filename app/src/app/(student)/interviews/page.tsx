import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Mic, Plus, Sparkles, Layers, Award, Clock } from "lucide-react";
import { getUserInterviews } from "@/actions/interviews";
import { InterviewCard } from "@/components/interviews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Mock Interviews — AI Placement Copilot",
  description: "Practice role-specific mock interviews powered by AI with structured questions and feedback.",
};

export default async function InterviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const interviews = await getUserInterviews();

  const totalInterviews = interviews.length;
  const completedCount = interviews.filter((i) => i.status === "COMPLETED").length;
  const avgScore =
    completedCount > 0
      ? Math.round(
          interviews
            .filter((i) => i.feedback?.totalScore)
            .reduce((acc, curr) => acc + (curr.feedback?.totalScore ?? 0), 0) /
            completedCount,
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AI Mock Interviews
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure custom role & tech-stack interviews with AI-generated questions and real-time practice.
          </p>
        </div>

        <Link
          href="/interviews/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create New Interview
        </Link>
      </div>

      {/* Stats row if interviews exist */}
      {totalInterviews > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border bg-card p-4 text-center shadow-2xs">
            <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-1">
              <Mic className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground">{totalInterviews}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Sessions</p>
          </div>

          <div className="rounded-2xl border bg-card p-4 text-center shadow-2xs">
            <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-1">
              <Layers className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
          </div>

          <div className="rounded-2xl border bg-card p-4 text-center shadow-2xs">
            <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-1">
              <Award className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground">
              {completedCount > 0 ? `${avgScore}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Average Score</p>
          </div>
        </div>
      )}

      {/* Main Interviews Grid or Empty State */}
      {totalInterviews === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center shadow-xs space-y-5">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Mic className="h-8 w-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground">
              No interview sessions yet
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create your first AI mock interview tailored to your desired job title and tech stack. Gemini AI will curate progressive questions to test your readiness.
            </p>
          </div>

          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Set Up Your First Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Your Interview Sessions ({totalInterviews})
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
