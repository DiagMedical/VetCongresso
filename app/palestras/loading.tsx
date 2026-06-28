export default function PalestrasLoading() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <div className="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-muted/30" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-muted/30" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-16 animate-pulse rounded-md bg-muted/30" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted/30" />
                <div className="h-5 w-14 shrink-0 animate-pulse rounded-full bg-muted/30" />
              </div>
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted/30" />
              <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
              <div className="flex items-center gap-4">
                <div className="h-3 w-24 animate-pulse rounded bg-muted/30" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted/30" />
              </div>
              <div className="mt-1 h-8 w-full animate-pulse rounded-md bg-muted/30" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
