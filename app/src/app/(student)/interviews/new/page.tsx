import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles, ShieldCheck, Zap, Bot } from "lucide-react";
import { CreateInterviewForm } from "@/components/interviews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set Up New AI Interview — AI Placement Copilot",
  description: "Configure role, level, and tech stack for AI question generation.",
};

export default async function NewInterviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/interviews"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Interviews
      </Link>

      {/* Page Heading */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
            <Bot className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Configure New Mock Interview
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Select your target role, assessment format, and tech stack. Gemini AI will curate 5 structured questions tailored to your calibration.
        </p>
      </div>

      {/* Form Card */}
      <CreateInterviewForm />

      {/* Feature Highlights Grid */}
      <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
        <div className="rounded-2xl border bg-card p-4 space-y-1.5 shadow-2xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-xs text-foreground">
            Role-Calibrated Questions
          </h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Progressive difficulty curve ranging from core concepts to scalable architectures.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-1.5 shadow-2xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Zap className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-xs text-foreground">
            Evaluation Guidance
          </h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Each question includes expected criteria and key concepts for self-preparation.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-1.5 shadow-2xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-xs text-foreground">
            Private Practice
          </h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your interview transcripts and responses remain confidential to your student account.
          </p>
        </div>
      </div>
    </div>
  );
}
