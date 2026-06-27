export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-muted/20" />
      <div className="rounded-lg border border-border p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="mb-1 h-3 w-24 rounded bg-muted/20" />
            <div className="h-9 w-full rounded bg-muted/20" />
          </div>
        ))}
      </div>
    </div>
  )
}
