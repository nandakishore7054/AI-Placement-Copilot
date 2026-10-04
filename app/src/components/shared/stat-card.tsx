import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    label?: string;
    isPositive?: boolean;
  };
  href?: string;
  badge?: string;
  accentColor?: "indigo" | "violet" | "emerald" | "amber" | "rose" | "sky";
  progress?: number;
  className?: string;
}

const ACCENT_STYLES = {
  indigo: {
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    bar: "bg-indigo-600 dark:bg-indigo-500",
    hoverBorder: "hover:border-indigo-500/40",
  },
  violet: {
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    bar: "bg-violet-600 dark:bg-violet-500",
    hoverBorder: "hover:border-violet-500/40",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    bar: "bg-emerald-600 dark:bg-emerald-500",
    hoverBorder: "hover:border-emerald-500/40",
  },
  amber: {
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    bar: "bg-amber-600 dark:bg-amber-500",
    hoverBorder: "hover:border-amber-500/40",
  },
  rose: {
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    bar: "bg-rose-600 dark:bg-rose-500",
    hoverBorder: "hover:border-rose-500/40",
  },
  sky: {
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    bar: "bg-sky-600 dark:bg-sky-500",
    hoverBorder: "hover:border-sky-500/40",
  },
};

export function StatCard({
  label,
  value,
  description,
  icon,
  trend,
  href,
  badge,
  accentColor = "indigo",
  progress,
  className,
}: StatCardProps) {
  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.indigo;

  const content = (
    <div className="flex flex-col justify-between h-full space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {badge}
            </span>
          )}
          {icon && (
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl border transition-colors shadow-2xs",
                accent.iconBg
              )}
            >
              {icon}
            </div>
          )}
          {href && (
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          )}
        </div>
      </div>

      <div>
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        {(description || trend) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  trend.isPositive !== false
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive !== false ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground truncate">{description}</span>
            )}
          </div>
        )}

        {typeof progress === "number" && (
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", accent.bar)}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "group block rounded-2xl border border-border bg-card p-5 shadow-xs shadow-inner-glow transition-all duration-200",
          accent.hoverBorder,
          "hover:-translate-y-0.5 hover:shadow-sm",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <Card className={cn("p-5 shadow-xs shadow-inner-glow rounded-2xl", className)}>
      {content}
    </Card>
  );
}
