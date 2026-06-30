'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Inbox, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPagination } from '@/components/admin/pagination'
import type { StatusInscricao } from '@/types'
import { formatDate } from '@/lib/utils'

export type LeadRow = {
  id: string
  nome: string
  email: string
  telefone: string
  created_at: string
  origem: string
  status: StatusInscricao | 'sorteio'
  palestra_id?: string | null
  palestra?: { id?: string; tema: string } | null
  source: 'inscrito' | 'sorteio'
}

interface LeadsTableProps {
  leads: LeadRow[]
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

export function LeadsTable({ leads, palestras, totalCount, limiteAtingido }: LeadsTableProps) {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [filtroPalestra, setFiltroPalestra] = useState('')
  const [ordem, setOrdem] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'created_at', dir: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  function toggleOrdem(col: string) {
    setOrdem((prev) => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  const statusLabels: Record<string, string> = {
    confirmado: 'Confirmado',
    'check-in': 'Check-in',
    cancelado_por_falta: 'Cancelado',
    espera: 'Espera',
    sorteio: 'Sorteio',
  }

  const statusColors: Record<string, string> = {
    confirmado: 'bg-primary/10 text-primary',
    'check-in': 'bg-success/10 text-success',
    cancelado_por_falta: 'bg-danger/10 text-danger',
    espera: 'bg-muted/30 text-muted',
    sorteio: 'bg-muted/30 text-muted',
  }

  const filtrados = useMemo(() => {
    const lista = leads.filter((i) => {
      if (busca) {
        const q = busca.toLowerCase()
        if (!i.nome.toLowerCase().includes(q) && !i.email.toLowerCase().includes(q) && !i.telefone.includes(q)) return false
      }
      if (filtroStatus && i.status !== filtroStatus) return false
      if (filtroPalestra && i.palestra_id !== filtroPalestra) return false
      return true
    })

    lista.sort((a, b) => {
      let cmp = 0
      switch (ordem.col) {
        case 'nome':
          cmp = a.nome.localeCompare(b.nome)
          break
        case 'email':
          cmp = a.email.localeCompare(b.email)
          break
        case 'status':
          cmp = String(a.status).localeCompare(String(b.status))
          break
        case 'origem':
          cmp = (a.origem ?? '').localeCompare(b.origem ?? '')
          break
        case 'created_at':
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return ordem.dir === 'asc' ? cmp : -cmp
    })

    return lista
  }, [leads, busca, filtroStatus, filtroPalestra, ordem])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize))
  const paginaAtual = Math.min(currentPage, totalPages)
  const visiveis = filtrados.slice((paginaAtual - 1) * pageSize, paginaAtual * pageSize)

  async function handleDelete(id: string, nome: string) {
    const lead = leads.find((item) => item.id === id)
    if (!lead) return

    if (!confirm(`Excluir registro de "${nome}"? Essa ação não pode ser desfeita.`)) return

    try {
      if (lead.source === 'sorteio') {
        const { removerSorteioLead } = await import('@/lib/actions/sorteio')
        await removerSorteioLead(id)
        toast.success('Lead do sorteio excluído!')
      } else {
        const { excluirInscrito } = await import('@/lib/actions/admin')
        await excluirInscrito(id)
        toast.success('Inscrição excluída!')
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  async function handleExport(formato: 'xlsx' | 'csv') {
    const { exportarLeadsConsolidados } = await import('@/lib/actions/admin')
    const { exportToXLSX, exportToCSV } = await import('@/lib/export')
    const data = await exportarLeadsConsolidados()

    if (formato === 'xlsx') {
      exportToXLSX(data, 'leads-vetcongresso')
    } else {
      exportToCSV(data, 'leads-vetcongresso')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center" role="search" aria-label="Filtrar leads">
        <div className="relative min-w-0 flex-1">
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
          onChange={(e) => setFiltroStatus(e.target.value)}
          aria-label="Filtrar por status"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground xl:w-auto"
        >
          <option value="">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="check-in">Check-in</option>
          <option value="cancelado_por_falta">Cancelado</option>
          <option value="espera">Espera</option>
          <option value="sorteio">Sorteio</option>
        </select>

        <select
          value={filtroPalestra}
          onChange={(e) => setFiltroPalestra(e.target.value)}
          aria-label="Filtrar por palestra"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground xl:w-auto"
        >
          <option value="">Todas as palestras</option>
          {palestras.map((p) => (
            <option key={p.id} value={p.id}>{p.tema}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            className="flex min-h-[44px] items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-card"
            aria-label="Exportar como XLSX"
          >
            <Download className="size-4" aria-hidden="true" />
            XLSX
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex min-h-[44px] items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-card"
            aria-label="Exportar como CSV"
          >
            <Download className="size-4" aria-hidden="true" />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Lista de leads">
            <caption className="sr-only">Lista de leads cadastrados</caption>
            <thead className="bg-card">
              <tr className="text-left text-muted">
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('nome')} className="flex items-center gap-1 transition-colors hover:text-foreground">
                    Nome <SetaIcon ordem={ordem} col="nome" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('email')} className="flex items-center gap-1 transition-colors hover:text-foreground">
                    Email <SetaIcon ordem={ordem} col="email" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">Telefone</th>
                <th scope="col" className="px-4 py-3 font-medium">Palestra</th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('status')} className="flex items-center gap-1 transition-colors hover:text-foreground">
                    Status <SetaIcon ordem={ordem} col="status" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('origem')} className="flex items-center gap-1 transition-colors hover:text-foreground">
                    Origem <SetaIcon ordem={ordem} col="origem" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('created_at')} className="flex items-center gap-1 transition-colors hover:text-foreground">
                    Data <SetaIcon ordem={ordem} col="created_at" />
                  </button>
                </th>
                <th scope="col" className="sr-only px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visiveis.map((i) => (
                <tr key={i.id} className="bg-background transition-colors hover:bg-card/50">
                  <td className="px-4 py-3 font-medium text-foreground">{i.nome}</td>
                  <td className="px-4 py-3 text-muted">{i.email}</td>
                  <td className="px-4 py-3 text-muted">{i.telefone}</td>
                  <td className="px-4 py-3 text-foreground">
                    {i.palestra?.tema ?? (i.source === 'sorteio' ? 'Sorteio Powerbank' : '—')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[i.status] ?? 'bg-muted/30 text-muted'}`}>
                      {statusLabels[i.status] ?? i.status}
                    </span>
                    <span className="ml-2 rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted">
                      {i.source === 'sorteio' ? 'Sorteio' : 'Reserva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{i.origem}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(i.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(i.id, i.nome)}
                      className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      title="Excluir registro"
                      aria-label={`Excluir ${i.nome}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtrados.length === 0 && (
          <div role="status" className="animate-fade-in flex flex-col items-center justify-center py-12 text-center">
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
                : 'Os leads aparecerão aqui conforme as reservas forem realizadas e conforme os cadastros do sorteio entrarem na lista.'}
            </p>
          </div>
        )}
      </div>

      {filtrados.length > 0 && (
        <AdminPagination
          currentPage={paginaAtual}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtrados.length}
          pageSize={pageSize}
          label="leads"
        />
      )}

      <p className="text-xs text-muted" role="status">
        Mostrando {visiveis.length} de {filtrados.length} leads filtrados
        {busca || filtroStatus || filtroPalestra ? '' : ` · ${totalCount} no total`}
        {limiteAtingido && ' (exibindo apenas os 1000 mais recentes)'}
      </p>
    </div>
  )
}
