export default function ResumeLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Main card skeleton */}
      <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-60 rounded bg-muted animate-pulse" />
            <div className="h-4 w-80 rounded bg-muted animate-pulse" />
          </div>
        </div>

        <div className="h-40 w-full rounded-2xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}
