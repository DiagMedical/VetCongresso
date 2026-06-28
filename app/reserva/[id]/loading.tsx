export default function ReservaLoading() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="mb-6 h-4 w-20 animate-pulse rounded bg-muted/30" />
        <div className="mb-6 space-y-2">
          <div className="h-7 w-64 animate-pulse rounded bg-muted/30" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted/30" />
          <div className="h-4 w-36 animate-pulse rounded bg-muted/30" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-12 w-full animate-pulse rounded-md bg-primary/20" />
        </div>
      </div>
    </div>
  )
}
