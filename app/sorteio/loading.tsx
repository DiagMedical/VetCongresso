export default function SorteioLoading() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <div className="mx-auto mb-3 h-10 w-64 animate-pulse rounded bg-muted/30" />
          <div className="mx-auto h-4 w-80 animate-pulse rounded bg-muted/30" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-12 w-full animate-pulse rounded-md bg-primary/20" />
        </div>
      </section>
    </div>
  )
}
