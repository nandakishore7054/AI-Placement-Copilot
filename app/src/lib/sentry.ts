import * as Sentry from "@sentry/nextjs";

/**
 * Captures an exception and safely forwards it to Sentry (if configured)
 * while also logging to the console.
 */
export function captureException(
  error: unknown,
  context?: Record<string, any>,
) {
  console.error("[Application Error]", error, context ? JSON.stringify(context) : "");

  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    try {
      Sentry.captureException(error, {
        extra: context,
      });
    } catch (e) {
      console.warn("[Sentry] Failed to capture exception:", e);
    }
  }
}

/**
 * Captures an informational or warning message to Sentry.
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, any>,
) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    try {
      Sentry.captureMessage(message, {
        level,
        extra: context,
      });
    } catch (e) {
      console.warn("[Sentry] Failed to capture message:", e);
    }
  }
}
