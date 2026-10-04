"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Menu,
  LayoutDashboard,
  Briefcase,
  FileText,
  Mic,
  Users,
  Activity,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PortalType, STUDENT_NAV, RECRUITER_NAV, ADMIN_NAV } from "./sidebar";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  portal: PortalType;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function MobileNav({
  portal,
  isOpen,
  onClose,
  onOpen,
}: MobileNavProps) {
  const pathname = usePathname();

  // Close drawer when route changes
  React.useEffect(() => {
    onClose();
  }, [pathname, onClose]);

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

  const bottomTabs = React.useMemo(() => {
    switch (portal) {
      case "recruiter":
        return [
          { title: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
          { title: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
          { title: "Applicants", href: "/recruiter/applicants", icon: Users },
        ];
      case "admin":
        return [
          { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
          { title: "Audit Trail", href: "/admin/audit-log", icon: Activity },
        ];
      case "student":
      default:
        return [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Jobs", href: "/jobs", icon: Briefcase },
          { title: "Applications", href: "/applications", icon: FileText },
          { title: "Interviews", href: "/interviews", icon: Mic },
        ];
    }
  }, [portal]);

  const isTabActive = (href: string) => {
    if (href === "/dashboard" || href === "/recruiter/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* ─── 1. Fixed Bottom Tab Bar (Mobile only) ────────────────── */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden px-2 shadow-lg"
      >
        {bottomTabs.map((tab) => {
          const active = isTabActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary")} />
              <span className="truncate max-w-[64px]">{tab.title}</span>
            </Link>
          );
        })}

        {/* "More" Trigger */}
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors",
            isOpen ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Open full menu"
        >
          <Menu className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>

      {/* ─── 2. Slide-Over Drawer Overlay ───────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ─── 3. Slide-Over Drawer Panel ─────────────────────────── */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-background border-l border-border shadow-xl md:hidden transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sections.map((section, sIndex) => (
            <div key={sIndex} className="space-y-1">
              {section.title && (
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isTabActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex h-9 items-center gap-3 rounded-lg px-2.5 text-xs font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between border-t border-border p-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle className="h-8 w-8" />
          </div>
        </div>
      </div>
    </>
  );
}
