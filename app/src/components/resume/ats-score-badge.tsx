"use client";

import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AtsScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AtsScoreBadge({
  score,
  showLabel = true,
  size = "md",
  className,
}: AtsScoreBadgeProps) {
  let tier: {
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    label: string;
  };

  if (score >= 80) {
    tier = {
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      label: "ATS Ready",
    };
  } else if (score >= 60) {
    tier = {
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      label: "Needs Tuning",
    };
  } else {
    tier = {
      color: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200",
      icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
      label: "Low ATS Match",
    };
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border shadow-2xs",
        tier.bg,
        tier.color,
        tier.border,
        sizeClasses[size],
        className
      )}
    >
      {tier.icon}
      <span>{score}/100</span>
      {showLabel && <span className="font-normal opacity-80">· {tier.label}</span>}
    </span>
  );
}
