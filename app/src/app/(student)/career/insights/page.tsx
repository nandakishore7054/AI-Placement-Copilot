import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCareerInsights } from "@/actions/career";
import { CareerInsightsFeed } from "@/components/career";
import { TrendingUp, ArrowLeft, Target, Map } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career & Placement Market Insights | AI Placement Copilot",
  description:
    "Live compensation benchmarks, hiring demand trends, and engineering placement analytics.",
};

export default async function CareerInsightsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const insights = await getCareerInsights(undefined, 30);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* ─── Breadcrumb & Navigation ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/career"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Career Hub</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Market & Placement Insights
            </h1>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              Live Intel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data-backed tech compensation ranges, skill demand shifts, and recruitment trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/career"
            className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            <Map className="h-3.5 w-3.5 text-indigo-600" />
            <span>Career Roadmap</span>
          </Link>
          <Link
            href="/skill-gap"
            className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            <Target className="h-3.5 w-3.5 text-indigo-600" />
            <span>Skill Gap Analysis</span>
          </Link>
        </div>
      </div>

      {/* ─── Insights Feed ─────────────────────────────────────────────────── */}
      <CareerInsightsFeed insights={insights} />
    </div>
  );
}
