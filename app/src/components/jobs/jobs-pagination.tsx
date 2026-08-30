// src/components/jobs/jobs-pagination.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobsPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function JobsPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
}: JobsPaginationProps) {
  const searchParams = useSearchParams();

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `?${params.toString()}`;
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  if (totalPages <= 1) return null;

  // Build visible page numbers (windowed around current page)
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (
      (i === 2 && currentPage > 3) ||
      (i === totalPages - 1 && currentPage < totalPages - 2)
    ) {
      pages.push("…");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium">{start}–{end}</span> of{" "}
        <span className="font-medium">{total}</span> jobs
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Prev */}
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted opacity-40 cursor-not-allowed">
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {/* Pages */}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p as number)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                p === currentPage
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-background hover:bg-muted"
              )}
            >
              {p}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted opacity-40 cursor-not-allowed">
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
