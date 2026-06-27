export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-24 rounded bg-muted/20" />
      <div className="h-10 w-full rounded-lg bg-muted/20" />
      <div className="rounded-lg border border-border">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="h-4 w-32 rounded bg-muted/20" />
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
