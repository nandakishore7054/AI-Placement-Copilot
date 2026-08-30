import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  BadgeCheck,
  Building2,
  Globe,
  Layers,
  FileText,
  Briefcase,
} from "lucide-react";
import { getApplicationById } from "@/actions/applications";
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
import { WithdrawApplicationDialog } from "@/components/applications/withdraw-application-dialog";
import { JobBadge } from "@/components/jobs/job-badge";
import { formatDate, timeAgo, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const application = await getApplicationById(id);
    if (!application) return { title: "Application Not Found" };
    return {
      title: `${application.job.title} Application — ${application.job.company.name}`,
      description: `View application status and details for ${application.job.title}`,
    };
  } catch {
    return { title: "Application Details" };
  }
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  let application;
  try {
    application = await getApplicationById(id);
  } catch (error) {
    // If unauthorized or error, show not found
    notFound();
  }

  if (!application) {
    notFound();
  }

  const { job, status, appliedAt, updatedAt, notes } = application;
  const company = job.company;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back navigation */}
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Applications
      </Link>

      {/* Hero Card */}
      <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-muted/50 overflow-hidden">
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

            {/* Title & Company */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="font-medium">{company.name}</span>
                {company.verified && (
                  <BadgeCheck className="h-4 w-4 text-indigo-500" />
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {job.title}
              </h1>
            </div>
          </div>

          {/* Status Badge & Actions */}
          <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
            <ApplicationStatusBadge status={status} />
            <WithdrawApplicationDialog
              applicationId={application.id}
              jobTitle={job.title}
              companyName={company.name}
              status={status}
              variant="button"
            />
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-1 border-t">
          <JobBadge type="level" value={job.level} />
          <JobBadge type="type" value={job.type} />
          {job.category && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {job.category}
            </span>
          )}
        </div>

        {/* Meta summary row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            Applied on {formatDate(appliedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
            Status updated {timeAgo(updatedAt)}
          </span>
          {job.salary && (
            <span className="font-semibold text-indigo-600">
              {job.salary}
            </span>
          )}
        </div>
      </div>

      {/* Application Timeline Progression */}
      <ApplicationTimeline
        status={status}
        appliedAt={appliedAt}
        updatedAt={updatedAt}
        notes={notes}
      />

      {/* Main Grid: Description + Sidebar Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Job Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Job Description
              </h2>
              <Link
                href={`/jobs/${job.id}`}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
              >
                View Public Listing ↗
              </Link>
            </div>

            {/* Rich text description */}
            <div
              className="prose prose-sm max-w-none text-foreground [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-1"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>
        </div>

        {/* Right Column: Application Details + Company Info */}
        <div className="space-y-6">
          {/* Application Info Card */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 border-b pb-2.5">
              <FileText className="h-4 w-4 text-indigo-500" />
              Application Record
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">Reference ID</span>
                <code className="text-[11px] font-mono bg-muted px-2 py-1 rounded block text-foreground truncate">
                  {application.id}
                </code>
              </div>

              <div className="flex justify-between py-1 border-b border-muted">
                <span className="text-muted-foreground">Current Status</span>
                <span className="font-medium text-foreground">
                  <ApplicationStatusBadge status={status} showIcon={false} />
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-muted">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium text-foreground">
                  {formatDate(appliedAt)}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(updatedAt)}
                </span>
              </div>

              {notes && (
                <div className="pt-2 border-t border-muted">
                  <span className="text-muted-foreground block mb-1">Feedback / Notes</span>
                  <p className="text-xs text-foreground bg-muted/60 p-2.5 rounded-lg leading-relaxed">
                    {notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* About Company Card */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
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
        </div>
      </div>
    </div>
  );
}
