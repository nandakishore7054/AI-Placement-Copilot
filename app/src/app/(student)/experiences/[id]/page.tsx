import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  BadgeCheck,
  Clock,
  Calendar,
  Globe,
  Layers,
  Award,
  BookOpen,
} from "lucide-react";
import { getExperienceById } from "@/actions/experiences";
import { JobBadge } from "@/components/jobs/job-badge";
import { formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const exp = await getExperienceById(id);
  if (!exp) return { title: "Experience Not Found" };
  return {
    title: `${exp.title} — ${exp.company.name}`,
    description: exp.description.slice(0, 155),
  };
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const experience = await getExperienceById(id);

  if (!experience) {
    notFound();
  }

  const { company } = experience;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/experiences"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Experiences
      </Link>

      {/* Hero Card */}
      <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-xs">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-muted/50 overflow-hidden shadow-2xs">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={company.name}
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {company.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium">{company.name}</span>
              {company.verified && (
                <BadgeCheck className="h-4 w-4 text-indigo-500" />
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {experience.title}
            </h1>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
          <JobBadge type="level" value={experience.level} />
          {experience.category && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {experience.category}
            </span>
          )}
          {experience.salary && (
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              {experience.salary}
            </span>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            Published {formatDate(experience.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
            {timeAgo(experience.createdAt)}
          </span>
        </div>

        {/* Optional Cover Image */}
        {experience.imageUrl && (
          <div className="relative h-64 w-full rounded-xl overflow-hidden border">
            <Image
              src={experience.imageUrl}
              alt={experience.title}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Main Grid: Description + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Full Experience Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-xs">
            <h2 className="font-semibold text-base text-foreground flex items-center gap-2 border-b pb-3">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Interview Process & Experience Insights
            </h2>

            <div
              className="prose prose-sm max-w-none text-foreground [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-1 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1"
              dangerouslySetInnerHTML={{ __html: experience.description }}
            />
          </div>
        </div>

        {/* Right Column: Company & Summary */}
        <div className="space-y-6">
          {/* About Company */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 border-b pb-2.5">
              <Building2 className="h-4 w-4 text-indigo-500" />
              About {company.name}
            </h3>

            {company.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {company.description}
              </p>
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              {company.industry && (
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <span>{company.industry}</span>
                </div>
              )}
              {company.size && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <span>{company.size} employees</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline truncate"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Summary */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 text-xs text-muted-foreground shadow-xs">
            <h3 className="font-semibold text-sm text-foreground">
              Experience Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-medium text-foreground">
                  {experience.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Target Level</span>
                <JobBadge type="level" value={experience.level} />
              </div>
              {experience.salary && (
                <div className="flex justify-between">
                  <span>Package / CTC</span>
                  <span className="font-semibold text-indigo-600">
                    {experience.salary}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
