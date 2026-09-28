"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, History } from "lucide-react";
import { toast } from "sonner";
import { deleteSkillGap } from "@/actions/skill-gap";
import { cn } from "@/lib/utils";

interface SkillGapItem {
  id: string;
  targetRole: string;
  matchPercentage: number;
  analyzedAt: Date | string;
}

interface SkillGapHistoryProps {
  analyses: SkillGapItem[];
  activeId?: string;
  className?: string;
}

export function SkillGapHistory({
  analyses,
  activeId,
  className = "",
}: SkillGapHistoryProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  if (analyses.length <= 1) return null;

  const handleDelete = (id: string, role: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete the analysis for "${role}"?`)) {
      return;
    }

    startDeleteTransition(async () => {
      try {
        const res = await deleteSkillGap(id);
        if (res.success) {
          toast.success(`Analysis for ${role} deleted.`);
          router.replace("/skill-gap");
          router.refresh();
        } else {
          toast.error(res.error || "Failed to delete analysis.");
        }
      } catch (err: any) {
        toast.error("Failed to delete analysis.");
      }
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <History className="h-3.5 w-3.5" />
        <span>Past Analyzed Roles ({analyses.length})</span>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {analyses.map((item) => {
          const isActive = item.id === activeId;

          return (
            <div
              key={item.id}
              className={cn(
                "group relative inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs transition-all",
                isActive
                  ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-xs ring-1 ring-indigo-500/20"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              <Link href={`/skill-gap?id=${item.id}`} className="flex items-center gap-2">
                <span>{item.targetRole}</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                    item.matchPercentage >= 70
                      ? "bg-emerald-100 text-emerald-800"
                      : item.matchPercentage >= 40
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-rose-100 text-rose-800"
                  )}
                >
                  {item.matchPercentage}%
                </span>
              </Link>

              <button
                type="button"
                onClick={(e) => handleDelete(item.id, item.targetRole, e)}
                disabled={isDeleting}
                title="Delete analysis"
                className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-0.5 rounded transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
