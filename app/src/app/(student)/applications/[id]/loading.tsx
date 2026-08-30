export default function ApplicationDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button skeleton */}
      <div className="h-5 w-36 rounded-md bg-muted animate-pulse" />

      {/* Hero card skeleton */}
      <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-xl bg-muted animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
              <div className="h-7 w-60 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-28 rounded-full bg-muted animate-pulse" />
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
        </div>

        <div className="flex gap-6 pt-1">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        </div>
      </div>

      {/* Timeline skeleton */}
      <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="h-6 w-44 rounded bg-muted animate-pulse" />
        <div className="space-y-6 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                <div className="h-3 w-72 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
