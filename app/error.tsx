'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-2xl font-bold text-foreground">Algo deu errado</h1>
      <p className="text-muted">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Tentar novamente
      </button>
    </div>
  )
}
