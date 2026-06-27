export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-28 rounded bg-muted/20" />
      <div className="rounded-lg border border-border p-4">
        <div className="space-y-3">
          <div className="h-10 w-full rounded bg-muted/20" />
          <div className="h-4 w-full rounded bg-muted/20" />
          <div className="h-4 w-3/4 rounded bg-muted/20" />
        </div>
      </div>
    </div>
  )
}
