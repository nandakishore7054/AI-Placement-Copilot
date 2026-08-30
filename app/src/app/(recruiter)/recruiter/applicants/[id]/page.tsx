import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Mail,
  Linkedin,
  Github,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  FileText,
  Building2,
  ExternalLink,
} from "lucide-react";
import { getRecruiterApplicationById } from "@/actions/applications";
import { StatusUpdateSelect } from "@/components/applications/status-update-select";
import { ApplicationTimeline } from "@/components/applications/application-timeline";
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
    const result = await getRecruiterApplicationById(id);
    if (!result?.application) return { title: "Applicant Not Found" };
    const { user, job } = result.application;
    return {
      title: `${user.firstName} ${user.lastName} — Applicant for ${job.title}`,
      description: `Review candidate profile and application status for ${job.title}`,
    };
  } catch {
    return { title: "Candidate Profile" };
  }
}

export default async function RecruiterApplicantDetailPage({
  params,
}: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  let result;
  try {
    result = await getRecruiterApplicationById(id);
  } catch {
    notFound();
  }

  if (!result?.application) {
    notFound();
  }

  const { application, canUpdateStatus } = result;
  const { user, job, status, appliedAt, updatedAt, notes } = application;
  const profile = user.studentProfile;
  const candidateName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/recruiter/applicants"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applicants
      </Link>

      {/* Hero Candidate Card */}
      <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-xl overflow-hidden shadow-2xs">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={candidateName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span>{user.firstName.charAt(0)}</span>
              )}
            </div>

            {/* Candidate Identity */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {candidateName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <a
                    href={`mailto:${user.email}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {user.email}
                  </a>
                </span>
                {profile?.expectedSalary && (
                  <span>
                    Expected:{" "}
                    <strong className="text-foreground">
                      {profile.expectedSalary}
                    </strong>
                  </span>
                )}
                {profile?.yearsOfExperience !== null &&
                  profile?.yearsOfExperience !== undefined && (
                    <span>
                      Experience:{" "}
                      <strong className="text-foreground">
                        {profile.yearsOfExperience}{" "}
                        {profile.yearsOfExperience === 1 ? "year" : "years"}
                      </strong>
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Status Update Control */}
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Application Status
            </span>
            <StatusUpdateSelect
              applicationId={application.id}
              companyId={job.companyId}
              currentStatus={status}
              canUpdateStatus={canUpdateStatus}
              size="default"
            />
          </div>
        </div>

        {/* Social / External Portfolio Links */}
        {(profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl) && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5" />
                <span>LinkedIn</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}

            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}

            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Portfolio</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Profile Details + Application Context */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Candidate Profile & Qualifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio / Summary */}
          {profile?.bio && (
            <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-xs">
              <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                About Candidate
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills Section */}
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-xs">
            <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Skills & Tech Stack
            </h2>

            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-medium text-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No specific skills listed in candidate profile.
              </p>
            )}
          </div>

          {/* Education Section */}
          {profile?.education && (
            <div className="rounded-2xl border bg-card p-6 space-y-3 shadow-xs">
              <h2 className="font-semibold text-base text-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-500" />
                Education Background
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {profile.education}
              </p>
            </div>
          )}

          {/* Application Progress Timeline */}
          <ApplicationTimeline
            status={status}
            appliedAt={appliedAt}
            updatedAt={updatedAt}
            notes={notes}
          />
        </div>

        {/* Right Column: Position Details & Record */}
        <div className="space-y-6">
          {/* Job Opening Details Card */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Position Applied For
              </h3>
              <Link
                href={`/recruiter/jobs/${job.id}/edit`}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
              >
                Edit Job
              </Link>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-sm text-foreground">
                {job.title}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <JobBadge type="level" value={job.level} />
                <JobBadge type="type" value={job.type} />
                {job.category && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {job.category}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground pt-2 space-y-1">
                {job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="font-semibold text-indigo-600">
                    {job.salary}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Application Record Metadata Card */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 border-b pb-2.5">
              <FileText className="h-4 w-4 text-indigo-500" />
              Application Record
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">
                  Application ID
                </span>
                <code className="text-[11px] font-mono bg-muted px-2 py-1 rounded block text-foreground truncate">
                  {application.id}
                </code>
              </div>

              <div className="flex justify-between py-1 border-b border-muted">
                <span className="text-muted-foreground">Applied Date</span>
                <span className="font-medium text-foreground">
                  {formatDate(appliedAt)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-muted">
                <span className="text-muted-foreground">Last Activity</span>
                <span className="font-medium text-foreground">
                  {timeAgo(updatedAt)}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Updated Exact</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
