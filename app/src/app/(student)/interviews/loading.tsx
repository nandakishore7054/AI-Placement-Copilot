export default function InterviewsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-xl" />
          <div className="h-4 w-72 bg-muted/60 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-muted rounded-xl" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-muted/40 rounded-2xl border" />
        <div className="h-24 bg-muted/40 rounded-2xl border" />
        <div className="h-24 bg-muted/40 rounded-2xl border" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-44 bg-muted/40 rounded-2xl border" />
        <div className="h-44 bg-muted/40 rounded-2xl border" />
      </div>
    </div>
  );
}
