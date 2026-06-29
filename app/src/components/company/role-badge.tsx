"use client";

import { CompanyRole } from "@prisma/client";

const ROLE_CONFIG: Record<
  CompanyRole,
  { label: string; color: string }
> = {
  OWNER: {
    label: "Owner",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  ADMIN: {
    label: "Admin",
    color: "bg-violet-100 text-violet-800 border-violet-200",
  },
  RECRUITER: {
    label: "Recruiter",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  HR: {
    label: "HR",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  INTERVIEWER: {
    label: "Interviewer",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

interface RoleBadgeProps {
  role: CompanyRole;
  size?: "sm" | "md";
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}
