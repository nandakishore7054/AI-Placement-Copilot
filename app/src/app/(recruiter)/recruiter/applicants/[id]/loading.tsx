export default function RecruiterApplicantDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button skeleton */}
      <div className="h-5 w-36 rounded-md bg-muted animate-pulse" />

      {/* Hero card skeleton */}
      <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-7 w-48 rounded bg-muted animate-pulse" />
              <div className="h-4 w-64 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-32 rounded-xl bg-muted animate-pulse" />
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <div className="h-7 w-20 rounded-xl bg-muted animate-pulse" />
          <div className="h-7 w-20 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>

      {/* Main content grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-16 w-full rounded bg-muted animate-pulse" />
          </div>
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-xl bg-muted animate-pulse" />
              <div className="h-6 w-20 rounded-xl bg-muted animate-pulse" />
              <div className="h-6 w-20 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-20 w-full rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
