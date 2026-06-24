'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, UserPlus, UserX } from 'lucide-react'
import Link from 'next/link'
import type { Palestra, Inscrito } from '@/types'
import { LiberarVagaDialog } from './liberar-vaga-dialog'
import { AdicionarParticipanteDialog } from './adicionar-participante-dialog'

interface DashboardActionsProps {
  palestras: Palestra[]
}

export function DashboardActions({ palestras }: DashboardActionsProps) {
  const router = useRouter()
  const [showLiberar, setShowLiberar] = useState(false)
  const [showAdicionar, setShowAdicionar] = useState(false)
  const [inscritos, setInscritos] = useState<Inscrito[]>([])

  async function openLiberarVaga() {
    const { listarInscritos } = await import('@/lib/actions/admin')
    const data = await listarInscritos()
    setInscritos(data)
    setShowLiberar(true)
  }

  async function handleCancelar(id: string) {
    const { cancelarPorFalta, listarInscritos: listar } = await import('@/lib/actions/admin')
    await cancelarPorFalta(id)
    const data = await listar()
    setInscritos(data)
    router.refresh()
  }

  async function handleAdicionar(data: { palestra_id: string; nome: string; email: string; telefone: string }) {
    const { adicionarParticipante } = await import('@/lib/actions/admin')
    await adicionarParticipante(data)
    router.refresh()
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Ações Rápidas</h3>
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/scanner"
            className="flex items-center gap-3 rounded-md bg-primary/10 min-h-[44px] p-3 text-primary hover:bg-primary/20 transition-colors"
          >
            <QrCode className="size-5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Scanner QR</p>
              <p className="text-xs text-muted">Realizar check-in dos participantes</p>
            </div>
          </Link>

          <button
            onClick={openLiberarVaga}
            className="flex items-center gap-3 rounded-md bg-danger/10 min-h-[44px] p-3 text-left text-danger hover:bg-danger/20 transition-colors"
          >
            <UserX className="size-5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Liberar Vaga</p>
              <p className="text-xs text-muted">Cancelar participante ausente</p>
            </div>
          </button>

          <button
            onClick={() => setShowAdicionar(true)}
            className="flex items-center gap-3 rounded-md bg-success/10 min-h-[44px] p-3 text-left text-success hover:bg-success/20 transition-colors"
          >
            <UserPlus className="size-5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Adicionar Participante</p>
              <p className="text-xs text-muted">Cadastro manual de fila física</p>
            </div>
          </button>
        </div>
      </div>

      <LiberarVagaDialog
        open={showLiberar}
        onClose={() => setShowLiberar(false)}
        inscritos={inscritos}
        onCancelar={handleCancelar}
      />

      <AdicionarParticipanteDialog
        open={showAdicionar}
        onClose={() => { setShowAdicionar(false); router.refresh() }}
        palestras={palestras}
        onAdicionar={handleAdicionar}
      />
    </>
  )
}
