'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import type { DashboardData } from '@/lib/actions/admin'

interface Props {
  data: DashboardData
}

export function DashboardResumoIA({ data }: Props) {
  const [resumo, setResumo] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const mounted = useRef(true)

  async function fetchResumo() {
    setCarregando(true)
    try {
      const { gerarResumoDashboard } = await import('@/lib/actions/admin')
      const texto = await gerarResumoDashboard(data)
      if (mounted.current) setResumo(texto)
    } catch {
      if (mounted.current) setResumo(null)
    } finally {
      if (mounted.current) setCarregando(false)
    }
  }

  useEffect(() => {
    mounted.current = true
    startTransition(() => { fetchResumo() })
    return () => { mounted.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Sparkles className="size-4 text-primary/60" />
          <span>Resumo do Dia</span>
        </div>
        <button
          onClick={fetchResumo}
          disabled={carregando}
          className="rounded-md p-1 text-muted hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Atualizar resumo"
        >
          <RefreshCw className={`size-3.5 ${carregando ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="mt-2 text-sm text-foreground/90 leading-relaxed" role="status" aria-live="polite">
        {carregando ? (
          <span className="inline-flex items-center gap-2 text-muted">
            <Loader2 className="size-3.5 animate-spin" />
            Gerando resumo...
          </span>
        ) : resumo ? (
          resumo
        ) : (
          <span className="text-muted">Resumo temporariamente indisponível.</span>
        )}
      </div>
    </div>
  )
}
