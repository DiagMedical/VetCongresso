export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-md bg-muted/20" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="size-10 rounded-md bg-muted/20" />
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted/20" />
              <div className="h-5 w-12 rounded bg-muted/20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 h-4 w-32 rounded bg-muted/20" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 w-full rounded bg-muted/20" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="h-4 w-36 rounded bg-muted/20" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-muted/20" />
          ))}
        </div>
      </div>
    </div>
  )
}
