export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 rounded bg-muted/20" />
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 h-4 w-40 rounded bg-muted/20" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-4 w-full rounded bg-muted/20" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="h-4 w-44 rounded bg-muted/20" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-muted/20" />
          ))}
        </div>
      </div>
    </div>
  )
}
