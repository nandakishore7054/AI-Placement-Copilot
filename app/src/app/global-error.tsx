"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/sentry";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="text-6xl select-none">⚠️</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Application Error</h1>
            <p className="text-muted-foreground text-sm">
              A critical error occurred. It has been reported to error monitoring.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
