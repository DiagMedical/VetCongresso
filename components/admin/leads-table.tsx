'use client'

import { useState } from 'react'
import { Download, Inbox, Search } from 'lucide-react'
import type { Inscrito, StatusInscricao } from '@/types'
import { formatDate } from '@/lib/utils'

interface LeadsTableProps {
  inscritos: Inscrito[]
  palestras: { id: string; tema: string }[]
}

export function LeadsTable({ inscritos, palestras }: LeadsTableProps) {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusInscricao | ''>('')
  const [filtroPalestra, setFiltroPalestra] = useState('')

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

  const filtrados = inscritos.filter((i) => {
    if (busca) {
      const q = busca.toLowerCase()
      if (!i.nome.toLowerCase().includes(q) && !i.email.toLowerCase().includes(q) && !i.telefone.includes(q)) return false
    }
    if (filtroStatus && i.status !== filtroStatus) return false
    if (filtroPalestra && i.palestra_id !== filtroPalestra) return false
    return true
  })

  async function handleExport(formato: 'xlsx' | 'csv') {
    const { exportarLeads } = await import('@/lib/actions/admin')
    const { exportToXLSX, exportToCSV } = await import('@/lib/export')
    const data = await exportarLeads(formato)

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
          <thead className="bg-card">
            <tr className="text-left text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Nome</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Telefone</th>
              <th scope="col" className="px-4 py-3 font-medium">Palestra</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Origem</th>
              <th scope="col" className="px-4 py-3 font-medium">Data</th>
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
        Mostrando {filtrados.length} de {inscritos.length} leads
      </p>
    </div>
  )
}
