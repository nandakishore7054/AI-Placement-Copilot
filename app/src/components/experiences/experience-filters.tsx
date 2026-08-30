"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter } from "lucide-react";
import { JOB_CATEGORIES, JOB_LEVEL_LABELS } from "@/lib/constants";
import { JobLevel } from "@prisma/client";
import { useDebounce } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";

export function ExperienceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(search, 350);

  const currentCategory = searchParams.get("category") ?? "";
  const currentLevel = searchParams.get("level") ?? "";

  // Apply search query changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.delete("page");

    startTransition(() => {
      router.push(`/experiences?${params.toString()}`);
    });
  }, [debouncedSearch]);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");

    startTransition(() => {
      router.push(`/experiences?${params.toString()}`);
    });
  }

  function clearAll() {
    setSearch("");
    startTransition(() => {
      router.push("/experiences");
    });
  }

  const hasActiveFilters = !!(
    searchParams.get("q") ||
    searchParams.get("category") ||
    searchParams.get("level")
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search interview & placement experiences…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-background pl-10 pr-10 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category dropdown */}
        <select
          value={currentCategory}
          onChange={(e) => setFilter("category", e.target.value)}
          className="w-full sm:w-52 rounded-xl border bg-background px-3 py-2.5 text-xs font-medium outline-none transition-all focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Level dropdown */}
        <select
          value={currentLevel}
          onChange={(e) => setFilter("level", e.target.value)}
          className="w-full sm:w-44 rounded-xl border bg-background px-3 py-2.5 text-xs font-medium outline-none transition-all focus:border-indigo-500"
        >
          <option value="">All Levels</option>
          {Object.entries(JOB_LEVEL_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border border-zinc-200 bg-background px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
