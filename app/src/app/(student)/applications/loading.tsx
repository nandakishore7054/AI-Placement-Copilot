export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Controls skeleton */}
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border bg-card p-5 space-y-4 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
              </div>

              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
              </div>

              <div className="space-y-1.5 pt-2 border-t">
                <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-36 rounded bg-muted animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-8 w-24 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
