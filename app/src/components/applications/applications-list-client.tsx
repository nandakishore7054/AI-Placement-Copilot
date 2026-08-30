"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Briefcase, X, SlidersHorizontal } from "lucide-react";
import { ApplicationStatus } from "@prisma/client";
import { ApplicationCard, ApplicationItem } from "./application-card";
import { cn } from "@/lib/utils";

interface ApplicationsListClientProps {
  initialApplications: ApplicationItem[];
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

export function ApplicationsListClient({
  initialApplications,
}: ApplicationsListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("ALL");

  // Calculate count for each status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: initialApplications.length };
    for (const app of initialApplications) {
      counts[app.status] = (counts[app.status] || 0) + 1;
    }
    return counts;
  }, [initialApplications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return initialApplications.filter((app) => {
      // Status filter
      if (statusFilter !== "ALL" && app.status !== statusFilter) {
        return false;
      }

      // Search query filter (matches title, company name, location, or category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = app.job.title.toLowerCase().includes(q);
        const matchesCompany = app.job.company.name.toLowerCase().includes(q);
        const matchesLocation = app.job.location?.toLowerCase().includes(q);
        const matchesCategory = app.job.category?.toLowerCase().includes(q);
        return matchesTitle || matchesCompany || matchesLocation || matchesCategory;
      }

      return true;
    });
  }, [initialApplications, statusFilter, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "ALL";

  // Total empty state (student hasn't applied to anything yet)
  if (initialApplications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-16 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <Briefcase className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-1.5">
          No applications yet
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Start exploring jobs and apply to opportunities that match your skills and career goals.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Briefcase className="h-4 w-4" />
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls: Search and Filter Tabs */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by job title, company name, or location…"
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

        {/* Status Filter Tabs (Scrollable on small screens) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.value] || 0;
            const isSelected = statusFilter === tab.value;

            // Only show status tabs that have items, unless it is "ALL" or currently selected
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
      </div>

      {/* Filter Stats Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filteredApplications.length} of {initialApplications.length}{" "}
          application{initialApplications.length === 1 ? "" : "s"}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Applications Grid */}
      {filteredApplications.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        /* Filter Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 py-12 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base mb-1">
            No matching applications
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mb-4">
            No applications match your current search query or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
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
