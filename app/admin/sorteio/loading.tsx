export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-28 rounded bg-muted/20" />
      <div className="flex gap-2">
        <div className="h-10 w-32 rounded bg-muted/20" />
        <div className="h-10 w-36 rounded bg-muted/20" />
      </div>
      <div className="rounded-lg border border-border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-muted/20" />
          ))}
        </div>
      </div>
    </div>
  )
}
