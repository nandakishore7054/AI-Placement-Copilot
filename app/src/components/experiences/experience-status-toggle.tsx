"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toggleExperienceVisibility } from "@/actions/experiences";
import { cn } from "@/lib/utils";

interface ExperienceStatusToggleProps {
  experienceId: string;
  companyId: string;
  isVisible: boolean;
}

export function ExperienceStatusToggle({
  experienceId,
  companyId,
  isVisible,
}: ExperienceStatusToggleProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      try {
        const updated = await toggleExperienceVisibility(experienceId, companyId);
        toast.success(
          updated.isVisible
            ? "Experience is now public."
            : "Experience is now hidden."
        );
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to toggle visibility."
        );
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isVisible ? "Click to hide" : "Click to publish"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border",
        isVisible
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
        "disabled:opacity-60 disabled:cursor-not-allowed"
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isVisible ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      <span>{isVisible ? "Published" : "Hidden"}</span>
    </button>
  );
}
