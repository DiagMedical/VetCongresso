export default function TicketLoading() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-md px-4 py-8 animate-pulse">
        <div className="mb-6 h-4 w-16 rounded bg-card" />

        <div className="mb-6 flex justify-center">
          <div className="h-8 w-56 rounded bg-card" />
        </div>

        <div className="flex flex-col items-center gap-6 rounded-lg border border-border bg-card p-6">
          <div className="size-44 rounded-lg bg-muted/30" />
          <div className="space-y-2 text-center">
            <div className="mx-auto h-5 w-48 rounded bg-muted/30" />
            <div className="mx-auto h-4 w-32 rounded bg-muted/30" />
          </div>
          <div className="space-y-1 text-center">
            <div className="mx-auto h-4 w-20 rounded bg-muted/30" />
            <div className="mx-auto h-4 w-36 rounded bg-muted/30" />
          </div>
          <div className="flex w-full gap-3">
            <div className="flex-1 h-10 rounded-md bg-muted/30" />
            <div className="flex-1 h-10 rounded-md bg-muted/30" />
          </div>
          <div className="w-full border-t border-border pt-4 space-y-2">
            <div className="mx-auto h-4 w-32 rounded bg-muted/30" />
            <div className="mx-auto h-4 w-48 rounded bg-muted/30" />
            <div className="mx-auto h-4 w-40 rounded bg-muted/30" />
          </div>
        </div>
      </div>
    </div>
  )
}
