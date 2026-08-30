export default function ExperiencesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Filter skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
        <div className="h-10 w-full sm:w-52 animate-pulse rounded-xl bg-muted" />
        <div className="h-10 w-full sm:w-44 animate-pulse rounded-xl bg-muted" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border bg-card p-5 space-y-4 shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
              </div>

              <div className="space-y-1 pt-1">
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
