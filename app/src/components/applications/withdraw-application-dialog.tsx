"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CornerDownLeft } from "lucide-react";
import { ApplicationStatus } from "@prisma/client";
import { withdrawApplication } from "@/actions/applications";
import { cn } from "@/lib/utils";

interface WithdrawApplicationDialogProps {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  variant?: "button" | "menu-item" | "link";
  className?: string;
  onSuccess?: () => void;
}

export function WithdrawApplicationDialog({
  applicationId,
  jobTitle,
  companyName,
  status,
  variant = "button",
  className,
  onSuccess,
}: WithdrawApplicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Rules: Cannot withdraw if already Accepted, Withdrawn, or Rejected
  const isWithdrawDisabled =
    status === ApplicationStatus.ACCEPTED ||
    status === ApplicationStatus.WITHDRAWN ||
    status === ApplicationStatus.REJECTED;

  if (isWithdrawDisabled) {
    return null;
  }

  function handleWithdraw() {
    startTransition(async () => {
      try {
        await withdrawApplication(applicationId);
        toast.success("Application withdrawn successfully.");
        setOpen(false);
        onSuccess?.();
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to withdraw application."
        );
        setOpen(false);
      }
    });
  }

  return (
    <>
      {/* Trigger Button */}
      {variant === "button" && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-95",
            className
          )}
        >
          <CornerDownLeft className="h-3.5 w-3.5 text-zinc-500" />
          <span>Withdraw</span>
        </button>
      )}

      {variant === "link" && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 hover:underline",
            className
          )}
        >
          <CornerDownLeft className="h-3.5 w-3.5" />
          <span>Withdraw Application</span>
        </button>
      )}

      {/* Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
          <div
            className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95"
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-dialog-title"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 shrink-0 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h2
                  id="withdraw-dialog-title"
                  className="font-semibold text-foreground text-base"
                >
                  Withdraw Application?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to withdraw your application for{" "}
                  <span className="font-semibold text-foreground">
                    &ldquo;{jobTitle}&rdquo;
                  </span>{" "}
                  at{" "}
                  <span className="font-medium text-foreground">
                    {companyName}
                  </span>
                  ? This will notify the recruiter and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="w-full sm:w-auto rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Withdrawing…" : "Confirm Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
