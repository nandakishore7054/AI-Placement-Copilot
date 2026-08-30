// src/app/(student)/jobs/loading.tsx
// Skeleton for the jobs listing page shown during streaming

export default function JobsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>

      {/* Filter bar skeleton */}
      <div className="space-y-3">
        <div className="h-10 w-full rounded-xl bg-muted" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-28 rounded-lg bg-muted" />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="rounded-2xl border p-5 space-y-3">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 w-24 rounded bg-muted" />
                <div className="h-4 w-40 rounded bg-muted" />
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 w-20 rounded-full bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
            <div className="flex gap-3">
              <div className="h-3.5 w-20 rounded bg-muted" />
              <div className="h-3.5 w-16 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
