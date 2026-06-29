import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// ─── Current User Helpers ─────────────────────────────────────────────────────

/**
 * Returns the currently authenticated Clerk userId.
 * Returns null if no session exists (use in Server Components / Actions).
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Returns the full Clerk user object for the current session.
 * Use when you need Clerk profile data (name, email, imageUrl).
 */
export async function getCurrentClerkUser() {
  return currentUser();
}

/**
 * Returns the DB User record for the currently authenticated user.
 * Returns null if the user has no session or no DB record yet.
 */
export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      companyMemberships: {
        include: { company: true },
      },
    },
  });
}

// ─── Role Guards ──────────────────────────────────────────────────────────────

/**
 * Asserts the current user has the specified UserRole.
 * Throws an error if not authenticated or role does not match.
 * Use at the top of Server Actions to gate access.
 */
export async function requireUserRole(role: UserRole): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated. Please sign in.");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) throw new Error("User record not found.");
  if (user.role !== role && user.role !== UserRole.ADMIN) {
    throw new Error(
      `Access denied. Required role: ${role}. Your role: ${user.role}.`,
    );
  }

  return userId;
}

/**
 * Asserts the current user is authenticated.
 * Returns userId. Throws if not authenticated.
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated. Please sign in.");
  return userId;
}

/**
 * Returns true if the current user has the ADMIN role.
 */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === UserRole.ADMIN;
}
