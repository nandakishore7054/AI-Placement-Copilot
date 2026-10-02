"use client";

import { useState, useTransition } from "react";
import { adminToggleJobVisibility } from "@/actions/admin";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function JobModerationToggle({
  jobId,
  initialVisible,
  jobTitle,
}: {
  jobId: string;
  initialVisible: boolean;
  jobTitle: string;
}) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const res = await adminToggleJobVisibility(jobId);
        setIsVisible(res.isVisible);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Failed to toggle job visibility");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isVisible ? "Hide from portal" : "Publish to portal"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
        isVisible
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isVisible ? (
        <Eye className="h-3 w-3 text-emerald-600" />
      ) : (
        <EyeOff className="h-3 w-3 text-amber-600" />
      )}
      <span>{isVisible ? "Active" : "Hidden"}</span>
    </button>
  );
}
