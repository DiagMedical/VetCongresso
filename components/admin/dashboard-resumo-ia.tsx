'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import type { DashboardData } from '@/lib/actions/admin'
import { AdminSectionCard } from '@/components/admin/section-card'

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
    <AdminSectionCard
      title="Resumo do Dia"
      description="Síntese automática da operação com base nos indicadores atuais do dashboard."
      icon={<Sparkles className="size-4 text-primary/60" />}
      bodyClassName="space-y-3"
    >
      <div className="flex justify-end">
        <button
          onClick={fetchResumo}
          disabled={carregando}
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs text-muted transition-colors hover:text-foreground disabled:opacity-50"
          aria-label="Atualizar resumo"
        >
          <RefreshCw className={`size-3.5 ${carregando ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>
      <div className="text-sm leading-relaxed text-foreground/90" role="status" aria-live="polite">
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
    </AdminSectionCard>
  )
}
