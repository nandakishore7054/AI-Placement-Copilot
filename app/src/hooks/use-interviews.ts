"use client";

import { useState, useCallback } from "react";
import type { InterviewStatus } from "@prisma/client";

interface InterviewFilters {
  status?: InterviewStatus;
  page?: number;
  pageSize?: number;
}

/**
 * Hook for managing interview listing filters.
 */
export function useInterviews(initialFilters: InterviewFilters = {}) {
  const [filters, setFilters] = useState<InterviewFilters>({
    page: 1,
    pageSize: 10,
    ...initialFilters,
  });

  const updateFilter = useCallback(
    <K extends keyof InterviewFilters>(key: K, value: InterviewFilters[K]) => {
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

  return { filters, updateFilter, setPage, resetFilters };
}
