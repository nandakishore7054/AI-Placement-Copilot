export default function ExperienceDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link skeleton */}
      <div className="h-5 w-36 rounded-md bg-muted animate-pulse" />

      {/* Hero card skeleton */}
      <div className="rounded-2xl border bg-card p-6 space-y-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-7 w-80 rounded bg-muted animate-pulse" />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
        </div>

        <div className="flex gap-6 pt-1">
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-xs">
            <div className="h-6 w-60 rounded bg-muted animate-pulse" />
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            <div className="h-16 w-full rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
