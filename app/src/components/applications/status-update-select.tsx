"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { ApplicationStatus } from "@prisma/client";
import { updateApplicationStatus } from "@/actions/applications";
import { ApplicationStatusBadge } from "./application-status-badge";
import { cn } from "@/lib/utils";

interface StatusUpdateSelectProps {
  applicationId: string;
  companyId: string;
  currentStatus: ApplicationStatus;
  canUpdateStatus: boolean;
  className?: string;
  size?: "sm" | "default";
}

const STATUS_OPTIONS: Array<{
  value: ApplicationStatus;
  label: string;
  description: string;
}> = [
  {
    value: ApplicationStatus.PENDING,
    label: "Applied",
    description: "Initial application received",
  },
  {
    value: ApplicationStatus.REVIEWED,
    label: "Under Review",
    description: "Profile under team review",
  },
  {
    value: ApplicationStatus.SHORTLISTED,
    label: "Shortlisted",
    description: "Qualified for next steps",
  },
  {
    value: ApplicationStatus.INTERVIEW_SCHEDULED,
    label: "Interview Scheduled",
    description: "Interview round setup",
  },
  {
    value: ApplicationStatus.ACCEPTED,
    label: "Accepted",
    description: "Candidate offered role",
  },
  {
    value: ApplicationStatus.REJECTED,
    label: "Not Selected",
    description: "Application declined",
  },
];

export function StatusUpdateSelect({
  applicationId,
  companyId,
  currentStatus,
  canUpdateStatus,
  className,
  size = "sm",
}: StatusUpdateSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // If user cannot update status (e.g. INTERVIEWER), show read-only badge
  if (!canUpdateStatus) {
    return (
      <div className="flex items-center gap-1.5" title="Requires HR or Admin permission to update">
        <ApplicationStatusBadge status={status} />
      </div>
    );
  }

  // If application is Withdrawn, it cannot be transitioned
  if (status === ApplicationStatus.WITHDRAWN) {
    return <ApplicationStatusBadge status={status} />;
  }

  function handleSelect(newStatus: ApplicationStatus) {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    startTransition(async () => {
      try {
        await updateApplicationStatus(applicationId, companyId, newStatus);
        setStatus(newStatus);
        const option = STATUS_OPTIONS.find((o) => o.value === newStatus);
        toast.success(`Status updated to ${option?.label || newStatus}`);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update status."
        );
      }
    });
  }

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => !isPending && setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "inline-flex items-center justify-between gap-1.5 rounded-xl border bg-background text-xs font-medium shadow-xs transition-all hover:bg-muted/60 active:scale-95 disabled:opacity-60",
          size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm"
        )}
      >
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Updating…</span>
          </span>
        ) : (
          <>
            <ApplicationStatusBadge status={status} showIcon={false} />
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-1.5 w-56 rounded-2xl border bg-card p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">
              Update Candidate Status
            </div>
            <div className="space-y-0.5">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = option.value === status;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-start justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors",
                      isSelected
                        ? "bg-indigo-50 text-indigo-900 font-medium"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <ApplicationStatusBadge
                          status={option.value}
                          showIcon={false}
                          className="px-2 py-0.5 text-[10px]"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
