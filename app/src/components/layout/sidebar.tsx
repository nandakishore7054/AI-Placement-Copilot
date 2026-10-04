"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Mic,
  FileSearch,
  Target,
  Compass,
  BookOpen,
  UserCircle,
  Users,
  Building2,
  UserPlus,
  Activity,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type PortalType = "student" | "recruiter" | "admin";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const STUDENT_NAV: NavSection[] = [
  {
    title: "Core",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { title: "Jobs", href: "/jobs", icon: Briefcase },
      { title: "Applications", href: "/applications", icon: FileText },
      { title: "Interviews", href: "/interviews", icon: Mic },
      { title: "Resume ATS", href: "/resume", icon: FileSearch },
    ],
  },
  {
    title: "Career Intelligence",
    items: [
      { title: "Skill Gap", href: "/skill-gap", icon: Target },
      { title: "Roadmap", href: "/career", icon: Compass },
      { title: "Experiences", href: "/experiences", icon: BookOpen },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Profile", href: "/profile", icon: UserCircle },
    ],
  },
];

export const RECRUITER_NAV: NavSection[] = [
  {
    title: "Recruiting",
    items: [
      { title: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard, exact: true },
      { title: "Job Listings", href: "/recruiter/jobs", icon: Briefcase },
      { title: "Applicants", href: "/recruiter/applicants", icon: Users },
      { title: "Experiences", href: "/recruiter/experiences", icon: BookOpen },
    ],
  },
  {
    title: "Organization",
    items: [
      { title: "Company Profile", href: "/recruiter/company", icon: Building2 },
      { title: "Team Members", href: "/recruiter/team", icon: UserPlus },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  {
    title: "Governance",
    items: [
      { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
      { title: "Audit Trail", href: "/admin/audit-log", icon: Activity },
    ],
  },
];

interface SidebarProps {
  portal: PortalType;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({
  portal,
  isCollapsed,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  const sections = React.useMemo(() => {
    switch (portal) {
      case "recruiter":
        return RECRUITER_NAV;
      case "admin":
        return ADMIN_NAV;
      case "student":
      default:
        return STUDENT_NAV;
    }
  }, [portal]);

  const brandInfo = React.useMemo(() => {
    switch (portal) {
      case "recruiter":
        return {
          mark: "R",
          title: "Recruiter Portal",
          sub: "Talent Ops",
          color: "bg-violet-600 text-white",
          home: "/recruiter/dashboard",
        };
      case "admin":
        return {
          mark: "A",
          title: "Admin Panel",
          sub: "Governance",
          color: "bg-rose-600 text-white",
          home: "/admin/dashboard",
        };
      case "student":
      default:
        return {
          mark: "AI",
          title: "Placement Copilot",
          sub: "Student Workspace",
          color: "bg-primary text-primary-foreground",
          home: "/dashboard",
        };
    }
  }, [portal]);

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out select-none",
          isCollapsed ? "w-16" : "w-60",
          className
        )}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-sidebar-border">
          <Link
            href={brandInfo.home}
            className="flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-90"
          >
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold tracking-tight shadow-xs",
                brandInfo.color
              )}
            >
              {brandInfo.mark}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-semibold text-xs text-foreground truncate">
                  {brandInfo.title}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {brandInfo.sub}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-none">
          {sections.map((section, sIndex) => (
            <div key={sIndex} className="space-y-1">
              {!isCollapsed && section.title && (
                <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isItemActive(item);
                  const Icon = item.icon;

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex h-9 w-full items-center justify-center rounded-lg text-xs font-medium transition-all duration-150",
                              active
                                ? "bg-primary/15 text-primary font-semibold shadow-inner-glow"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                            )}
                          >
                            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150",
                        active
                          ? "bg-primary/12 text-primary font-semibold shadow-inner-glow"
                          : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate flex-1">{item.title}</span>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Collapse Toggle */}
        <div className="border-t border-sidebar-border p-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "flex h-8 w-full items-center rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
              isCollapsed ? "justify-center" : "justify-between px-2.5"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!isCollapsed && <span>Collapse Sidebar</span>}
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
