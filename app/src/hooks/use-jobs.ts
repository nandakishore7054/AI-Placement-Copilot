"use client";

import { useState, useCallback } from "react";
import { useDebounce } from "./use-debounce";
import type { JobFilters } from "@/types";

/**
 * Hook for managing job listing filters and search state.
 * Debounces the query string to reduce API calls.
 */
export function useJobs(initialFilters: JobFilters = {}) {
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    pageSize: 10,
    ...initialFilters,
  });

  const debouncedQuery = useDebounce(filters.query ?? "", 400);

  const updateFilter = useCallback(
    <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    [],
  );

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, pageSize: 10 });
  }, []);

  return {
    filters: { ...filters, query: debouncedQuery },
    rawQuery: filters.query ?? "",
    updateFilter,
    setPage,
    resetFilters,
  };
}
