"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { PortalType } from "./sidebar";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  portal: PortalType;
  onOpenMobileNav: () => void;
  className?: string;
}

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/jobs": "Jobs Discovery",
  "/applications": "Applications",
  "/interviews": "AI Mock Interviews",
  "/interviews/new": "New Interview Session",
  "/resume": "Resume & ATS Intelligence",
  "/skill-gap": "Skill Gap Analysis",
  "/career": "Career Roadmap",
  "/career/insights": "Market Insights",
  "/experiences": "Interview Experiences",
  "/profile": "Student Profile",
  "/recruiter/dashboard": "Recruiter Dashboard",
  "/recruiter/jobs": "Job Listings",
  "/recruiter/jobs/new": "Post New Job",
  "/recruiter/applicants": "Candidate Pipeline",
  "/recruiter/experiences": "Shared Experiences",
  "/recruiter/company": "Company Profile",
  "/recruiter/team": "Team Members",
  "/admin/dashboard": "Admin Overview",
  "/admin/audit-log": "System Audit Trail",
};

export function TopHeader({
  portal,
  onOpenMobileNav,
  className,
}: TopHeaderProps) {
  const pathname = usePathname();

  const pageTitle = React.useMemo(() => {
    if (ROUTE_TITLES[pathname]) {
      return ROUTE_TITLES[pathname];
    }
    // Handle dynamic routes like /jobs/[id], /interviews/[id]
    if (pathname.startsWith("/jobs/")) return "Job Details";
    if (pathname.startsWith("/applications/")) return "Application Details";
    if (pathname.startsWith("/interviews/") && pathname.endsWith("/feedback")) return "Interview Feedback";
    if (pathname.startsWith("/interviews/")) return "Interview Session";
    if (pathname.startsWith("/experiences/")) return "Experience Details";
    if (pathname.startsWith("/recruiter/applicants/")) return "Applicant Details";
    if (pathname.startsWith("/recruiter/jobs/")) return "Job Management";
    return "Placement Copilot";
  }, [pathname]);

  const portalBadge = React.useMemo(() => {
    switch (portal) {
      case "recruiter":
        return { label: "Recruiter", color: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20" };
      case "admin":
        return { label: "Admin", color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20" };
      case "student":
      default:
        return { label: "Student", color: "bg-primary/10 text-primary border-primary/20" };
    }
  }, [portal]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6 transition-colors",
        className
      )}
    >
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileNav}
          className="md:hidden -ml-1 text-muted-foreground hover:text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-foreground text-sm tracking-tight truncate">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right: Portal indicator, theme switch, user profile */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide",
            portalBadge.color
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
          {portalBadge.label}
        </span>

        <ThemeToggle className="h-8 w-8 text-muted-foreground hover:text-foreground" />

        <div className="flex items-center pl-1 border-l border-border/80">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-7 w-7 ring-1 ring-border",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
