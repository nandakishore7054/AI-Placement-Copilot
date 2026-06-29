"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Debounces a value by the specified delay in milliseconds.
 * Used for search inputs to prevent excessive API calls.
 *
 * @example
 * const debouncedQuery = useDebounce(query, 400);
 * useEffect(() => { fetchJobs(debouncedQuery); }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
}
