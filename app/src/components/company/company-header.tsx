"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";
import type { Company } from "@prisma/client";

interface CompanyHeaderProps {
  company: Pick<Company, "id" | "name" | "logoUrl" | "industry" | "size" | "website" | "verified">;
  memberCount?: number;
  jobCount?: number;
}

export function CompanyHeader({
  company,
  memberCount,
  jobCount,
}: CompanyHeaderProps) {
  return (
    <div className="flex items-start gap-5">
      {/* Logo */}
      <div className="relative h-16 w-16 shrink-0 rounded-xl border bg-white overflow-hidden shadow-sm">
        {company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={`${company.name} logo`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-indigo-50">
            <Building2 className="h-8 w-8 text-indigo-400" />
          </div>
        )}
        {company.verified && (
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {company.name}
          </h1>
          {company.verified && (
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Verified
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          {company.industry && (
            <span>{company.industry}</span>
          )}
          {company.size && (
            <>
              <span>·</span>
              <span>{company.size} employees</span>
            </>
          )}
          {typeof memberCount === "number" && (
            <>
              <span>·</span>
              <span>{memberCount} team member{memberCount !== 1 ? "s" : ""}</span>
            </>
          )}
          {typeof jobCount === "number" && (
            <>
              <span>·</span>
              <span>{jobCount} active job{jobCount !== 1 ? "s" : ""}</span>
            </>
          )}
        </div>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {company.website.replace(/^https?:\/\//, "")}
            <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
