import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FileText, Sparkles, ShieldCheck, Zap, Bot } from "lucide-react";
import { getResume } from "@/actions/resume";
import { ResumeViewer } from "@/components/resume/resume-viewer";
import { ResumeUploader } from "@/components/resume/resume-uploader";
import { ResumeAnalysisView } from "@/components/resume/resume-analysis-view";
import { AnalyzeResumeButton } from "@/components/resume/analyze-resume-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume & AI ATS Intelligence — AI Placement Copilot",
  description: "AI-powered resume analysis, ATS compatibility scoring, and keyword optimization.",
};

export default async function ResumePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resume = await getResume();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Resume & ATS Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your resume in PDF format for instant AI ATS scoring, keyword matching, and placement optimization.
        </p>
      </div>

      {/* Main Content */}
      {resume ? (
        <div className="space-y-6">
          {/* Analysis View or Run CTA */}
          {resume.analysis ? (
            <ResumeAnalysisView analysis={resume.analysis} />
          ) : (
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 shadow-xs shadow-inner-glow space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs">
                      <Bot className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Ready for AI Resume & ATS Audit
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    Get an instant breakdown of your ATS score, recruiter keyword coverage, content depth rating, and actionable suggestions powered by Gemini.
                  </p>
                </div>

                <AnalyzeResumeButton />
              </div>
            </div>
          )}

          {/* Stored Resume File & Text Viewer */}
          <ResumeViewer resume={resume} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Uploader Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs shadow-inner-glow space-y-4">
            <div className="flex items-center gap-3 border-b border-border/80 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-base text-foreground">
                  Upload Your Resume
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select or drag a PDF copy of your latest resume
                </p>
              </div>
            </div>

            <ResumeUploader />
          </div>

          {/* Benefits Info Grid */}
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-xs shadow-inner-glow">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xs text-foreground">
                Automatic Text Parsing
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your skills, work experience, and educational background are extracted automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-xs shadow-inner-glow">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xs text-foreground">
                Encrypted Storage
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your PDF is stored securely on private cloud storage and accessible only by you and verified recruiters.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-xs shadow-inner-glow">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-xs text-foreground">
                AI Placement Intelligence
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Powers AI match recommendations and customized interview preparation based on your experience.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
