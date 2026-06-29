'use client'

import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-dvh items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertTriangle className="size-12 text-danger/60" />
          <h1 className="text-xl font-bold text-foreground">Erro na aplicação</h1>
          <p className="text-sm text-muted">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
