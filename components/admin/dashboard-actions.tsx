'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, UserPlus, UserX } from 'lucide-react'
import Link from 'next/link'
import type { Palestra, Inscrito } from '@/types'
import { LiberarVagaDialog } from './liberar-vaga-dialog'
import { AdicionarParticipanteDialog } from './adicionar-participante-dialog'
import { AdminSectionCard } from '@/components/admin/section-card'

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
      <AdminSectionCard
        title="Ações rápidas"
        description="Atalhos para check-in, liberação de vaga e cadastro manual."
      >
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/scanner"
            className="flex min-h-[44px] items-center gap-3 rounded-xl bg-primary/10 p-3 text-primary transition-colors hover:bg-primary/20"
          >
            <QrCode className="size-5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Scanner QR</p>
              <p className="text-xs text-muted">Realizar check-in dos participantes</p>
            </div>
          </Link>

          <button
            onClick={openLiberarVaga}
            className="flex min-h-[44px] items-center gap-3 rounded-xl bg-danger/10 p-3 text-left text-danger transition-colors hover:bg-danger/20"
          >
            <UserX className="size-5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Liberar Vaga</p>
              <p className="text-xs text-muted">Cancelar participante ausente</p>
            </div>
          </button>

          <button
            onClick={() => setShowAdicionar(true)}
            className="flex min-h-[44px] items-center gap-3 rounded-xl bg-success/10 p-3 text-left text-success transition-colors hover:bg-success/20"
          >
            <UserPlus className="size-5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Adicionar Participante</p>
              <p className="text-xs text-muted">Cadastro manual de fila física</p>
            </div>
          </button>
        </div>
      </AdminSectionCard>

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
