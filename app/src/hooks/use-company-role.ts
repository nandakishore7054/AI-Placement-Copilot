"use client";

import { useEffect, useState } from "react";
import type { CompanyRole } from "@prisma/client";
import { hasPermission } from "@/lib/auth/rbac";

interface UseCompanyRoleResult {
  role: CompanyRole | null;
  isLoading: boolean;
  can: (requiredRole: CompanyRole) => boolean;
}

/**
 * Client-side hook that resolves the current user's CompanyRole
 * for a given company. Used to conditionally render UI elements
 * based on the RBAC permission matrix.
 *
 * @param companyId - The company to check membership for
 * @param initialRole - Optional pre-fetched role (from server component)
 *
 * @example
 * const { can } = useCompanyRole(companyId, member.role);
 * if (can(CompanyRole.ADMIN)) { ... }
 */
export function useCompanyRole(
  _companyId: string,
  initialRole: CompanyRole | null = null,
): UseCompanyRoleResult {
  const [role, setRole] = useState<CompanyRole | null>(initialRole);
  const [isLoading, setIsLoading] = useState(initialRole === null);

  useEffect(() => {
    // If the role was pre-fetched server-side, skip the client fetch.
    if (initialRole !== null) {
      setRole(initialRole);
      setIsLoading(false);
    }
    // Phase 2+: For fully-client scenarios, fetch from a thin API endpoint.
    // Typically the role is passed down from Server Components.
  }, [initialRole]);

  const can = (requiredRole: CompanyRole): boolean => {
    if (!role) return false;
    return hasPermission(role, requiredRole);
  };

  return { role, isLoading, can };
}
