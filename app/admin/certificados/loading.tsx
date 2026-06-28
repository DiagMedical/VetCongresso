export default function CertificadosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 rounded bg-card" />
        <div className="h-5 w-36 rounded bg-card" />
      </div>
      <div className="h-10 w-72 rounded-md bg-card" />
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="bg-card px-4 py-3 flex gap-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-background px-4 py-3 flex gap-4 border-t border-border">
            <div className="h-4 w-32 rounded bg-card" />
            <div className="h-4 w-48 rounded bg-card" />
            <div className="h-4 w-40 rounded bg-card" />
            <div className="h-4 w-32 rounded bg-card" />
            <div className="h-4 w-16 rounded bg-card" />
          </div>
        ))}
      </div>
    </div>
  )
}
