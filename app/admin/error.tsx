'use client'

import { AlertTriangle } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('AdminError caught:', error);
  const message = error instanceof Error ? error.message : 'Erro inesperado';
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="size-12 text-danger/60" />
      <h1 className="text-xl font-bold text-foreground">Algo deu errado</h1>
        <p className="max-w-md text-sm text-muted">
          Ocorreu um erro ao carregar esta página. Tente novamente.
        </p>
        <pre className="mt-2 max-w-md whitespace-pre-wrap text-xs text-muted">{message}</pre>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 transition-all"
      >
        Tentar novamente
      </button>
    </div>
  )
}
