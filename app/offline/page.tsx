import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted/20">
          <WifiOff className="size-8 text-muted" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Sem Conexão</h1>
        <p className="text-muted">
          Você está offline. Conecte-se à internet para continuar usando o
          DiagnosticCRM.
        </p>
        <Link
          href="/admin"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          Tentar Novamente
        </Link>
      </div>
    </div>
  )
}
