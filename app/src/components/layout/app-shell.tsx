"use client";

import * as React from "react";
import { Sidebar, PortalType } from "./sidebar";
import { TopHeader } from "./top-header";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  portal: PortalType;
  children: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = "ai_placement_sidebar_collapsed";

export function AppShell({ portal, children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Restore collapsed preference from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {
      // localStorage may fail in private mode
    }
    setMounted(true);
  }, []);

  const handleToggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* 1. Desktop Sidebar */}
      <Sidebar
        portal={portal}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 2. Main Content Column */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden min-w-0 bg-background relative">
        {/* Ambient background lighting gradient */}
        <div className="pointer-events-none absolute inset-0 bg-ambient-radial opacity-70" aria-hidden="true" />

        {/* Sticky Top Header */}
        <TopHeader
          portal={portal}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main
          className={cn(
            "relative flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 pb-20 md:pb-8 transition-colors",
            "focus-visible:outline-none"
          )}
          id="main-content"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* 3. Mobile Navigation (Bottom Tab Bar + Drawer) */}
      <MobileNav
        portal={portal}
        isOpen={isMobileNavOpen}
        onOpen={() => setIsMobileNavOpen(true)}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </div>
  );
}
