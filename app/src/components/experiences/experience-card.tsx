"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, BadgeCheck, Clock, ArrowRight, Sparkles } from "lucide-react";
import { JobLevel } from "@prisma/client";
import { JobBadge } from "@/components/jobs/job-badge";
import { formatDate, timeAgo, truncate } from "@/lib/utils";

export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  level: JobLevel;
  salary?: string | null;
  imageUrl?: string | null;
  createdAt: Date | string;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
    verified?: boolean;
  };
}

interface ExperienceCardProps {
  experience: ExperienceItem;
  className?: string;
}

export function ExperienceCard({ experience, className }: ExperienceCardProps) {
  const { company } = experience;

  // Strip HTML tags for clean card excerpt
  const plainTextExcerpt = experience.description
    .replace(/<[^>]*>?/gm, "")
    .trim();

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all duration-200 hover:border-zinc-300 hover:shadow-md">
      <div className="space-y-4">
        {/* Top Header: Company logo & name */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50 overflow-hidden">
              {company.logoUrl ? (
                <Image
                  src={company.logoUrl}
                  alt={company.name}
                  fill
                  sizes="44px"
                  className="object-contain p-1"
                />
              ) : (
                <Building2 className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="truncate font-medium">{company.name}</span>
                {company.verified && (
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                )}
              </div>
              <Link
                href={`/experiences/${experience.id}`}
                className="group-hover:text-indigo-600 transition-colors"
              >
                <h3 className="text-base font-semibold tracking-tight text-foreground truncate mt-0.5">
                  {experience.title}
                </h3>
              </Link>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
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

        {/* Excerpt */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {truncate(plainTextExcerpt, 160)}
        </p>
      </div>

      {/* Footer / Meta */}
      <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeAgo(experience.createdAt)}</span>
        </span>

        <Link
          href={`/experiences/${experience.id}`}
          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group-hover:translate-x-0.5"
        >
          <span>Read More</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
