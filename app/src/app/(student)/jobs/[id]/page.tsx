// src/app/(student)/jobs/[id]/page.tsx
// Server component — fetches a single job and renders the full detail view.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  BadgeCheck,
  Globe,
  Building2,
  Layers,
} from "lucide-react";
import { getJobById, getUserApplicationStatuses } from "@/actions/student-jobs";
import { ApplyButton } from "@/components/jobs/apply-button";
import { JobBadge } from "@/components/jobs/job-badge";
import { timeAgo, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} at ${job.company.name}`,
    description: job.description.slice(0, 155),
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  const statuses = await getUserApplicationStatuses([job.id]);
  const applicationStatus = statuses[job.id];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Hero card */}
      <div className="rounded-2xl border bg-card p-6 space-y-5">
        {/* Company + title */}
        <div className="flex items-start gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-muted overflow-hidden">
            {job.company.logoUrl ? (
              <Image
                src={job.company.logoUrl}
                alt={job.company.name}
                fill
                className="object-contain p-1"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {job.company.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="font-medium text-muted-foreground">
                {job.company.name}
              </p>
              {job.company.verified && (
                <BadgeCheck className="h-4 w-4 text-indigo-500" />
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <JobBadge type="level" value={job.level} />
          <JobBadge type="type" value={job.type} />
          {job.category && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-slate-50 text-slate-600 border-slate-200">
              {job.category}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {job._count.applications} applicant
            {job._count.applications !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Posted {timeAgo(job.createdAt)}
          </span>
        </div>

        {/* Salary */}
        {job.salary && (
          <p className="text-lg font-bold text-indigo-600">{job.salary}</p>
        )}

        {/* Apply button */}
        <div className="pt-2">
          <ApplyButton
            jobId={job.id}
            existingStatus={applicationStatus}
            applyLink={job.applyLink}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Two-column layout: description + sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Description */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-base">Job Description</h2>
          <div
            className="prose prose-sm max-w-none text-foreground [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-1"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* Sidebar — company info */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">About {job.company.name}</h2>

            {job.company.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {job.company.description}
              </p>
            )}

            <div className="space-y-2 text-xs text-muted-foreground">
              {job.company.industry && (
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span>{job.company.industry}</span>
                </div>
              )}
              {job.company.size && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{job.company.size} employees</span>
                </div>
              )}
              {job.company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {job.company.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Job summary card */}
          <div className="rounded-2xl border bg-card p-5 space-y-3 text-xs text-muted-foreground">
            <h2 className="font-semibold text-sm text-foreground">Job Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Posted</span>
                <span className="font-medium text-foreground">
                  {formatDate(job.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-medium text-foreground">
                  {job.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Type</span>
                <span className="font-medium text-foreground">
                  <JobBadge type="type" value={job.type} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Level</span>
                <span className="font-medium text-foreground">
                  <JobBadge type="level" value={job.level} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
