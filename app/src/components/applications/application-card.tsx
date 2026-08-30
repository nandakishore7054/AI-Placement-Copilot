"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  BadgeCheck,
  Building2,
} from "lucide-react";
import { ApplicationStatus, JobLevel, JobType } from "@prisma/client";
import { ApplicationStatusBadge } from "./application-status-badge";
import { WithdrawApplicationDialog } from "./withdraw-application-dialog";
import { JobBadge } from "@/components/jobs/job-badge";
import { formatDate, timeAgo } from "@/lib/utils";

export interface ApplicationItem {
  id: string;
  status: ApplicationStatus;
  appliedAt: Date | string;
  updatedAt: Date | string;
  notes?: string | null;
  job: {
    id: string;
    title: string;
    location: string;
    category: string;
    level: JobLevel;
    type: JobType;
    salary?: string | null;
    company: {
      id: string;
      name: string;
      logoUrl?: string | null;
      verified?: boolean;
    };
  };
}

interface ApplicationCardProps {
  application: ApplicationItem;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { job, status, appliedAt, updatedAt } = application;
  const company = job.company;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-md">
      {/* Top Header: Company logo, name, status */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Company Logo / Fallback */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50 overflow-hidden">
              {company.logoUrl ? (
                <Image
                  src={company.logoUrl}
                  alt={company.name}
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              ) : (
                <Building2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* Company Name & Job Title */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="truncate font-medium">{company.name}</span>
                {company.verified && (
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                )}
              </div>
              <Link
                href={`/applications/${application.id}`}
                className="group-hover:text-indigo-600 transition-colors"
              >
                <h3 className="text-base font-semibold tracking-tight text-foreground truncate mt-0.5">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            <ApplicationStatusBadge status={status} />
          </div>
        </div>

        {/* Job metadata tags */}
        <div className="flex flex-wrap items-center gap-2">
          <JobBadge type="level" value={job.level} />
          <JobBadge type="type" value={job.type} />
          {job.category && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              {job.category}
            </span>
          )}
        </div>

        {/* Meta details: location, salary, dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{job.location || "Remote"}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <span>Applied {formatDate(appliedAt)}</span>
          </div>

          {job.salary && (
            <div className="font-medium text-indigo-600 text-xs sm:col-span-2">
              {job.salary}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-muted-foreground/80 sm:col-span-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span>Updated {timeAgo(updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions: View details + withdraw */}
      <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t">
        <WithdrawApplicationDialog
          applicationId={application.id}
          jobTitle={job.title}
          companyName={company.name}
          status={status}
          variant="link"
        />

        <Link
          href={`/applications/${application.id}`}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors active:scale-95"
        >
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
