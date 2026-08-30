export default function RecruiterApplicantsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Filter controls skeleton */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
        <div className="h-10 w-full md:w-64 animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-3 border-b last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                <div className="h-3 w-48 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-28 rounded bg-muted animate-pulse" />
            <div className="h-7 w-24 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-20 rounded-xl bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
