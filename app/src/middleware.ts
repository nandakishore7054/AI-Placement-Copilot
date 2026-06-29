import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ─── Route Matchers ──────────────────────────────────────────────────────────

/** Routes that require authentication (all protected dashboard routes) */
const isProtectedRoute = createRouteMatcher([
  // Student routes
  "/dashboard(.*)",
  "/jobs(.*)",
  "/applications(.*)",
  "/interviews(.*)",
  "/resume(.*)",
  "/experiences(.*)",
  "/profile(.*)",
  "/skill-gap(.*)",
  "/career(.*)",
  // Recruiter routes
  "/recruiter(.*)",
  // Admin routes
  "/admin(.*)",
]);

/** Routes only accessible when NOT authenticated */
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

/** Public API routes (no auth required) */
const isPublicApiRoute = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/api/jobs",
  "/api/jobs/(.*)",
  "/api/experiences",
  "/api/experiences/(.*)",
  "/api/subscribe",
  "/api/insights",
  "/api/cron/(.*)",
]);

// ─── Middleware ───────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  const { nextUrl } = req;

  // Public API routes pass through without auth
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard routes — redirect unauthenticated users to sign-in
  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
