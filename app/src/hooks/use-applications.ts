"use client";

import { useState, useCallback } from "react";
import type { ApplicationStatus } from "@prisma/client";

interface ApplicationFilters {
  status?: ApplicationStatus;
  page?: number;
  pageSize?: number;
}

/**
 * Hook for managing application listing filters and status updates.
 */
export function useApplications(initialFilters: ApplicationFilters = {}) {
  const [filters, setFilters] = useState<ApplicationFilters>({
    page: 1,
    pageSize: 10,
    ...initialFilters,
  });

  const [selectedStatus, setSelectedStatus] = useState<
    ApplicationStatus | "ALL"
  >("ALL");

  const updateFilter = useCallback(
    <K extends keyof ApplicationFilters>(
      key: K,
      value: ApplicationFilters[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    [],
  );

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const filterByStatus = useCallback((status: ApplicationStatus | "ALL") => {
    setSelectedStatus(status);
    setFilters((prev) => ({
      ...prev,
      status: status === "ALL" ? undefined : status,
      page: 1,
    }));
  }, []);

  return {
    filters,
    selectedStatus,
    updateFilter,
    setPage,
    filterByStatus,
  };
}
