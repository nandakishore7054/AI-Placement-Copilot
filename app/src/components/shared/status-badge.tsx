import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
  {
    variants: {
      status: {
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        info:
          "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
        primary:
          "border-primary/25 bg-primary/10 text-primary",
        destructive:
          "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
        neutral:
          "border-border bg-muted/60 text-muted-foreground",
      },
      size: {
        default: "text-[11px] px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.5",
        lg: "text-xs px-3 py-1",
      },
    },
    defaultVariants: {
      status: "neutral",
      size: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
}

export function StatusBadge({
  children,
  status,
  size,
  dot = false,
  pulse = false,
  icon,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {(dot || pulse) && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                status === "success" && "bg-emerald-400",
                status === "warning" && "bg-amber-400",
                status === "info" && "bg-sky-400",
                status === "primary" && "bg-primary",
                status === "destructive" && "bg-rose-400",
                (!status || status === "neutral") && "bg-muted-foreground"
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              status === "success" && "bg-emerald-500",
              status === "warning" && "bg-amber-500",
              status === "info" && "bg-sky-500",
              status === "primary" && "bg-primary",
              status === "destructive" && "bg-rose-500",
              (!status || status === "neutral") && "bg-muted-foreground/60"
            )}
          />
        </span>
      )}
      {icon && <span className="[&_svg]:size-3 shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

/** Helper to map raw ApplicationStatus to unified badge props */
export function getApplicationBadgeStatus(status: string): {
  status: "success" | "warning" | "info" | "primary" | "destructive" | "neutral";
  label: string;
} {
  switch (status) {
    case "ACCEPTED":
    case "OFFERED":
      return { status: "success", label: "Accepted" };
    case "SHORTLISTED":
      return { status: "primary", label: "Shortlisted" };
    case "INTERVIEW":
    case "INTERVIEW_SCHEDULED":
      return { status: "info", label: "Interview" };
    case "REVIEWING":
    case "REVIEWED":
      return { status: "warning", label: "Under Review" };
    case "PENDING":
    case "APPLIED":
      return { status: "neutral", label: "Applied" };
    case "REJECTED":
      return { status: "destructive", label: "Rejected" };
    case "WITHDRAWN":
      return { status: "neutral", label: "Withdrawn" };
    default:
      return { status: "neutral", label: status };
  }
}

/** Helper to map raw InterviewStatus to unified badge props */
export function getInterviewBadgeStatus(status: string): {
  status: "success" | "warning" | "info" | "primary" | "destructive" | "neutral";
  label: string;
} {
  switch (status) {
    case "COMPLETED":
      return { status: "success", label: "Completed" };
    case "IN_PROGRESS":
      return { status: "warning", label: "In Progress" };
    case "DRAFT":
      return { status: "neutral", label: "Draft" };
    default:
      return { status: "neutral", label: status };
  }
}
