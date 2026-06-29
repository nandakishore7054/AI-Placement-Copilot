import { CompanyRole } from "@prisma/client";
import { db } from "@/lib/db";

// ─── Permission Hierarchy ─────────────────────────────────────────────────────
// Higher index = more permissions (used for >= comparisons)
const ROLE_HIERARCHY: CompanyRole[] = [
  CompanyRole.INTERVIEWER,
  CompanyRole.HR,
  CompanyRole.RECRUITER,
  CompanyRole.ADMIN,
  CompanyRole.OWNER,
];

/**
 * Returns the numeric rank of a CompanyRole.
 * OWNER (4) > ADMIN (3) > RECRUITER (2) > HR (1) > INTERVIEWER (0)
 */
export function getRoleRank(role: CompanyRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Returns true if `userRole` has at least the same privileges as `requiredRole`.
 * Example: hasPermission(ADMIN, RECRUITER) → true
 */
export function hasPermission(
  userRole: CompanyRole,
  requiredRole: CompanyRole,
): boolean {
  return getRoleRank(userRole) >= getRoleRank(requiredRole);
}

// ─── Database Helpers ─────────────────────────────────────────────────────────

/**
 * Fetches the CompanyMember record for a given user and company.
 * Returns null if the user is not a member of the company.
 */
export async function getCompanyMember(userId: string, companyId: string) {
  return db.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });
}

/**
 * Returns true if the user has at least `requiredRole` in the specified company.
 * Always returns false if the user has no membership record.
 */
export async function checkCompanyPermission(
  userId: string,
  companyId: string,
  requiredRole: CompanyRole,
): Promise<boolean> {
  const member = await getCompanyMember(userId, companyId);
  if (!member) return false;
  return hasPermission(member.role, requiredRole);
}

/**
 * Asserts that the user has at least `requiredRole` in the company.
 * Throws an error if the check fails — use inside Server Actions.
 */
export async function requireCompanyPermission(
  userId: string,
  companyId: string,
  requiredRole: CompanyRole,
): Promise<void> {
  const allowed = await checkCompanyPermission(userId, companyId, requiredRole);
  if (!allowed) {
    throw new Error(
      `Insufficient permissions. Required role: ${requiredRole}.`,
    );
  }
}

// ─── Permission Matrix Constants ──────────────────────────────────────────────

/** Minimum role required for each action (from Architecture V2 RBAC matrix) */
export const PERMISSIONS = {
  COMPANY_SETTINGS: CompanyRole.OWNER,
  MANAGE_MEMBERS: CompanyRole.ADMIN,
  POST_JOB: CompanyRole.RECRUITER,
  EDIT_JOB: CompanyRole.RECRUITER,
  DELETE_JOB: CompanyRole.ADMIN,
  TOGGLE_JOB_VISIBILITY: CompanyRole.RECRUITER,
  POST_EXPERIENCE: CompanyRole.RECRUITER,
  EDIT_EXPERIENCE: CompanyRole.RECRUITER,
  VIEW_APPLICANTS: CompanyRole.INTERVIEWER,
  UPDATE_APPLICATION_STATUS: CompanyRole.HR,
  VIEW_DASHBOARD: CompanyRole.INTERVIEWER,
  DELETE_COMPANY: CompanyRole.OWNER,
} as const;
