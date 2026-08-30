"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Users,
  Briefcase,
  X,
  SlidersHorizontal,
  Mail,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { ApplicationStatus, JobLevel, JobType } from "@prisma/client";
import { StatusUpdateSelect } from "./status-update-select";
import { ApplicationStatusBadge } from "./application-status-badge";
import { JobBadge } from "@/components/jobs/job-badge";
import { formatDate, timeAgo, cn } from "@/lib/utils";

export interface RecruiterApplicationItem {
  id: string;
  status: ApplicationStatus;
  appliedAt: Date | string;
  updatedAt: Date | string;
  notes?: string | null;
  job: {
    id: string;
    title: string;
    category: string;
    level: JobLevel;
    type: JobType;
    location: string;
    salary?: string | null;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl?: string | null;
    studentProfile?: {
      bio?: string | null;
      skills?: string[];
      education?: string | null;
      expectedSalary?: string | null;
      yearsOfExperience?: number | null;
      linkedinUrl?: string | null;
      githubUrl?: string | null;
      portfolioUrl?: string | null;
    } | null;
  };
}

interface RecruiterApplicantsClientProps {
  initialApplications: RecruiterApplicationItem[];
  companyId: string;
  canUpdateStatus: boolean;
  selectedJobId?: string;
}

type StatusFilterOption = ApplicationStatus | "ALL";

const STATUS_TABS: Array<{ label: string; value: StatusFilterOption }> = [
  { label: "All", value: "ALL" },
  { label: "Applied", value: ApplicationStatus.PENDING },
  { label: "Under Review", value: ApplicationStatus.REVIEWED },
  { label: "Shortlisted", value: ApplicationStatus.SHORTLISTED },
  { label: "Interviews", value: ApplicationStatus.INTERVIEW_SCHEDULED },
  { label: "Accepted", value: ApplicationStatus.ACCEPTED },
  { label: "Not Selected", value: ApplicationStatus.REJECTED },
  { label: "Withdrawn", value: ApplicationStatus.WITHDRAWN },
];

export function RecruiterApplicantsClient({
  initialApplications,
  companyId,
  canUpdateStatus,
  selectedJobId,
}: RecruiterApplicantsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("ALL");
  const [jobFilter, setJobFilter] = useState<string>(selectedJobId || "ALL");

  // Extract distinct jobs
  const jobOptions = useMemo(() => {
    const jobMap = new Map<string, { id: string; title: string; count: number }>();
    for (const app of initialApplications) {
      const existing = jobMap.get(app.job.id);
      if (existing) {
        existing.count += 1;
      } else {
        jobMap.set(app.job.id, {
          id: app.job.id,
          title: app.job.title,
          count: 1,
        });
      }
    }
    return Array.from(jobMap.values());
  }, [initialApplications]);

  // Status counts based on current job filter
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    for (const app of initialApplications) {
      if (jobFilter !== "ALL" && app.job.id !== jobFilter) {
        continue;
      }
      counts.ALL += 1;
      counts[app.status] = (counts[app.status] || 0) + 1;
    }
    return counts;
  }, [initialApplications, jobFilter]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return initialApplications.filter((app) => {
      // Job filter
      if (jobFilter !== "ALL" && app.job.id !== jobFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && app.status !== statusFilter) {
        return false;
      }

      // Search query (candidate name, email, skills, or job title)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const candidateName = `${app.user.firstName} ${app.user.lastName}`.toLowerCase();
        const candidateEmail = app.user.email.toLowerCase();
        const jobTitle = app.job.title.toLowerCase();
        const skills = (app.user.studentProfile?.skills || []).join(" ").toLowerCase();

        return (
          candidateName.includes(q) ||
          candidateEmail.includes(q) ||
          jobTitle.includes(q) ||
          skills.includes(q)
        );
      }

      return true;
    });
  }, [initialApplications, jobFilter, statusFilter, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || statusFilter !== "ALL" || jobFilter !== "ALL";

  // Total empty state
  if (initialApplications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-16 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <Users className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-1.5">
          No applicants yet
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Candidates who apply to your posted jobs will appear here for review and hiring management.
        </p>
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Briefcase className="h-4 w-4" />
          Manage Job Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidates by name, email, skills, or job title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border bg-background pl-10 pr-10 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Job Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={jobFilter}
            onChange={(e) => {
              setJobFilter(e.target.value);
              setStatusFilter("ALL");
            }}
            className="w-full md:w-64 rounded-xl border bg-background px-3.5 py-2.5 text-xs font-medium outline-none transition-all focus:border-indigo-500"
          >
            <option value="ALL">All Jobs ({initialApplications.length})</option>
            {jobOptions.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const count = statusCounts[tab.value] || 0;
          const isSelected = statusFilter === tab.value;

          if (tab.value !== "ALL" && count === 0 && !isSelected) {
            return null;
          }

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all",
                isSelected
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Info Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filteredApplications.length} candidate
          {filteredApplications.length === 1 ? "" : "s"}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setJobFilter("ALL");
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-2xl border bg-card overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Candidate</th>
                  <th className="py-3.5 px-3">Position Applied</th>
                  <th className="py-3.5 px-3">Skills / Profile</th>
                  <th className="py-3.5 px-3">Applied</th>
                  <th className="py-3.5 px-3">Status Action</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredApplications.map((app) => {
                  const candidateName = `${app.user.firstName} ${app.user.lastName}`;
                  const skills = app.user.studentProfile?.skills || [];

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Candidate Name & Email */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm overflow-hidden">
                            {app.user.imageUrl ? (
                              <Image
                                src={app.user.imageUrl}
                                alt={candidateName}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <span>{app.user.firstName.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/recruiter/applicants/${app.id}`}
                              className="font-semibold text-foreground hover:text-indigo-600 transition-colors block truncate"
                            >
                              {candidateName}
                            </Link>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {app.user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Job Title & Level */}
                      <td className="py-4 px-3">
                        <div className="space-y-1 min-w-0 max-w-[200px]">
                          <span className="font-medium text-foreground text-xs block truncate">
                            {app.job.title}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <JobBadge type="level" value={app.job.level} />
                            <JobBadge type="type" value={app.job.type} />
                          </div>
                        </div>
                      </td>

                      {/* Skills Preview */}
                      <td className="py-4 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {skills.length > 0 ? (
                            <>
                              {skills.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                                >
                                  {skill}
                                </span>
                              ))}
                              {skills.length > 3 && (
                                <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                                  +{skills.length - 3}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No skills listed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="py-4 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        <div>{formatDate(app.appliedAt)}</div>
                        <div className="text-[11px] text-muted-foreground/70">
                          {timeAgo(app.appliedAt)}
                        </div>
                      </td>

                      {/* Status Update Control */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <StatusUpdateSelect
                          applicationId={app.id}
                          companyId={companyId}
                          currentStatus={app.status}
                          canUpdateStatus={canUpdateStatus}
                        />
                      </td>

                      {/* Action Detail Link */}
                      <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                        <Link
                          href={`/recruiter/applicants/${app.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors active:scale-95"
                        >
                          <span>Review</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {filteredApplications.map((app) => {
              const candidateName = `${app.user.firstName} ${app.user.lastName}`;
              const skills = app.user.studentProfile?.skills || [];

              return (
                <div
                  key={app.id}
                  className="rounded-2xl border bg-card p-4 space-y-3.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm overflow-hidden">
                        {app.user.imageUrl ? (
                          <Image
                            src={app.user.imageUrl}
                            alt={candidateName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span>{app.user.firstName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/recruiter/applicants/${app.id}`}
                          className="font-semibold text-sm hover:text-indigo-600 transition-colors block"
                        >
                          {candidateName}
                        </Link>
                        <span className="text-xs text-muted-foreground block truncate">
                          {app.user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-1.5">
                    <div className="text-xs font-medium text-foreground">
                      {app.job.title}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <JobBadge type="level" value={app.job.level} />
                      <JobBadge type="type" value={app.job.type} />
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <span className="text-muted-foreground">
                      Applied {timeAgo(app.appliedAt)}
                    </span>
                    <StatusUpdateSelect
                      applicationId={app.id}
                      companyId={companyId}
                      currentStatus={app.status}
                      canUpdateStatus={canUpdateStatus}
                    />
                  </div>

                  <Link
                    href={`/recruiter/applicants/${app.id}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <span>View Candidate Profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Filter Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-12 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base mb-1">
            No matching candidates
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mb-4">
            Try adjusting your search query, status tab, or job filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setJobFilter("ALL");
            }}
            className="rounded-xl border bg-background px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
