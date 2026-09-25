import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  Sparkles,
  Award,
  AlertCircle,
  Clock,
  Mic,
} from "lucide-react";
import { getInterview } from "@/actions/interviews";
import { getFeedback } from "@/actions/feedback";
import { FeedbackView } from "@/components/interviews/feedback-view";
import { GenerateFeedbackButton } from "@/components/interviews/generate-feedback-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: FeedbackPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const interview = await getInterview(id);
    return {
      title: `${interview.role} Interview Feedback — AI Placement Copilot`,
      description: `Comprehensive AI performance evaluation for ${interview.role} mock interview.`,
    };
  } catch {
    return {
      title: "Interview Feedback — AI Placement Copilot",
    };
  }
}

export default async function InterviewFeedbackPage({
  params,
}: FeedbackPageProps) {
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

  let feedback = null;
  try {
    feedback = await getFeedback(id);
  } catch (error) {
    console.error("[InterviewFeedbackPage] Error loading feedback:", error);
  }

  // If feedback already generated, render the complete evaluation
  if (feedback) {
    return (
      <FeedbackView
        interview={{
          id: interview.id,
          role: interview.role,
          type: interview.type,
          level: interview.level,
          techStack: interview.techStack,
          duration: interview.duration,
          createdAt: interview.createdAt,
          questions: interview.questions,
        }}
        feedback={feedback}
      />
    );
  }

  // If feedback not generated yet, check if transcript exists
  const hasTranscript = Boolean(interview.transcript && interview.transcript.trim().length >= 20);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Back button */}
      <Link
        href={`/interviews/${interview.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Interview Room
      </Link>

      <div className="rounded-3xl border bg-card p-8 sm:p-10 shadow-xs text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Award className="h-8 w-8" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {interview.role} Interview Evaluation
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hasTranscript
              ? "Your interview session is completed and the transcript is recorded. Generate your Gemini AI evaluation to unlock 5-category scoring, per-question analysis, and strengths."
              : "No recorded transcript found yet. You must complete your voice interview session with spoken dialogue before AI feedback can be generated."}
          </p>
        </div>

        {hasTranscript ? (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <GenerateFeedbackButton interviewId={interview.id} />
            <Link
              href={`/interviews/${interview.id}`}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Review Transcript & Questions
            </Link>
          </div>
        ) : (
          <div className="pt-2 flex justify-center">
            <Link
              href={`/interviews/${interview.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <Mic className="h-4 w-4" />
              Go to Interview Room & Practice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
