'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Inbox, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import type { Inscrito, StatusInscricao } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface LeadsTableProps {
  inscritos: Inscrito[]
  palestras: { id: string; tema: string }[]
  totalCount: number
  limiteAtingido: boolean
}

function SetaIcon({ ordem, col }: { ordem: { col: string; dir: string }; col: string }) {
  if (ordem.col !== col) return <ArrowUpDown className="ml-1 inline size-3 text-muted/40" />
  return ordem.dir === 'asc'
    ? <ArrowUp className="ml-1 inline size-3 text-primary" />
    : <ArrowDown className="ml-1 inline size-3 text-primary" />
}

export function LeadsTable({ inscritos, palestras, totalCount, limiteAtingido }: LeadsTableProps) {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusInscricao | ''>('')
  const [filtroPalestra, setFiltroPalestra] = useState('')
  const [ordem, setOrdem] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'created_at', dir: 'desc' })

  function toggleOrdem(col: string) {
    setOrdem((prev) => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  const statusLabels: Record<StatusInscricao, string> = {
    confirmado: 'Confirmado',
    'check-in': 'Check-in',
    cancelado_por_falta: 'Cancelado',
    espera: 'Espera',
  }

  const statusColors: Record<StatusInscricao, string> = {
    confirmado: 'bg-primary/10 text-primary',
    'check-in': 'bg-success/10 text-success',
    cancelado_por_falta: 'bg-danger/10 text-danger',
    espera: 'bg-muted/30 text-muted',
  }

  const filtrados = useMemo(() => {
    const filtrados = inscritos.filter((i) => {
      if (busca) {
        const q = busca.toLowerCase()
        if (!i.nome.toLowerCase().includes(q) && !i.email.toLowerCase().includes(q) && !i.telefone.includes(q)) return false
      }
      if (filtroStatus && i.status !== filtroStatus) return false
      if (filtroPalestra && i.palestra_id !== filtroPalestra) return false
      return true
    })

    filtrados.sort((a, b) => {
      let cmp = 0
      switch (ordem.col) {
        case 'nome': cmp = a.nome.localeCompare(b.nome); break
        case 'email': cmp = a.email.localeCompare(b.email); break
        case 'status': cmp = a.status.localeCompare(b.status); break
        case 'origem': cmp = (a.origem ?? '').localeCompare(b.origem ?? ''); break
        case 'created_at': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
      }
      return ordem.dir === 'asc' ? cmp : -cmp
    })

    return filtrados
  }, [inscritos, busca, filtroStatus, filtroPalestra, ordem])

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir inscrição de "${nome}"? Essa ação não pode ser desfeita.`)) return
    try {
      const { excluirInscrito } = await import('@/lib/actions/admin')
      await excluirInscrito(id)
      toast.success('Inscrição excluída!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  async function handleExport(formato: 'xlsx' | 'csv') {
    const { exportarLeads } = await import('@/lib/actions/admin')
    const { exportToXLSX, exportToCSV } = await import('@/lib/export')
    const data = await exportarLeads()

    if (formato === 'xlsx') {
      exportToXLSX(data, 'leads-vetcongresso')
    } else {
      exportToCSV(data, 'leads-vetcongresso')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3" role="search" aria-label="Filtrar leads">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            aria-label="Buscar leads"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as StatusInscricao | '')}
          aria-label="Filtrar por status"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="check-in">Check-in</option>
          <option value="cancelado_por_falta">Cancelado</option>
          <option value="espera">Espera</option>
        </select>

        <select
          value={filtroPalestra}
          onChange={(e) => setFiltroPalestra(e.target.value)}
          aria-label="Filtrar por palestra"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">Todas as palestras</option>
          {palestras.map((p) => (
            <option key={p.id} value={p.id}>{p.tema}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1 rounded-md border border-border min-h-[44px] px-3 py-2 text-sm text-foreground hover:bg-card transition-colors"
            aria-label="Exportar como XLSX"
          >
            <Download className="size-4" aria-hidden="true" />
            XLSX
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1 rounded-md border border-border min-h-[44px] px-3 py-2 text-sm text-foreground hover:bg-card transition-colors"
            aria-label="Exportar como CSV"
          >
            <Download className="size-4" aria-hidden="true" />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm" aria-label="Lista de leads">
          <caption className="sr-only">Lista de leads cadastrados</caption>
          <thead className="bg-card">
            <tr className="text-left text-muted">
              <th scope="col" className="px-4 py-3 font-medium">
                <button onClick={() => toggleOrdem('nome')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Nome <SetaIcon ordem={ordem} col="nome" />
                </button>
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                <button onClick={() => toggleOrdem('email')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Email <SetaIcon ordem={ordem} col="email" />
                </button>
              </th>
              <th scope="col" className="px-4 py-3 font-medium">Telefone</th>
              <th scope="col" className="px-4 py-3 font-medium">Palestra</th>
              <th scope="col" className="px-4 py-3 font-medium">
                <button onClick={() => toggleOrdem('status')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Status <SetaIcon ordem={ordem} col="status" />
                </button>
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                <button onClick={() => toggleOrdem('origem')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Origem <SetaIcon ordem={ordem} col="origem" />
                </button>
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                <button onClick={() => toggleOrdem('created_at')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Data <SetaIcon ordem={ordem} col="created_at" />
                </button>
              </th>
              <th scope="col" className="px-4 py-3 font-medium sr-only">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((i) => (
              <tr key={i.id} className="bg-background hover:bg-card/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{i.nome}</td>
                <td className="px-4 py-3 text-muted">{i.email}</td>
                <td className="px-4 py-3 text-muted">{i.telefone}</td>
                <td className="px-4 py-3 text-foreground">
                  {i.palestra?.tema ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[i.status]}`}>
                    {statusLabels[i.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{i.origem}</td>
                <td className="px-4 py-3 text-muted text-xs">{formatDate(i.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(i.id, i.nome)}
                    className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                    title="Excluir inscrição"
                    aria-label={`Excluir inscrição de ${i.nome}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <div role="status" className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="mb-4 text-muted/40">
              <Inbox className="mx-auto size-12" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {busca || filtroStatus || filtroPalestra
                ? 'Nenhum lead encontrado'
                : 'Nenhum lead cadastrado'}
            </p>
            <p className="mt-1 text-xs text-muted">
              {busca || filtroStatus || filtroPalestra
                ? 'Tente ajustar os filtros para encontrar mais resultados.'
                : 'Os leads aparecerão aqui conforme as reservas forem realizadas.'}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted" role="status">
        Mostrando {filtrados.length} de {totalCount} leads
        {limiteAtingido && ' (exibindo apenas os 1000 mais recentes)'}
      </p>
    </div>
  )
}
