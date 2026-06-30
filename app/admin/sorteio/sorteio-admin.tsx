'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Download, Search, ExternalLink, Shuffle, Trophy, X, Trash2 } from 'lucide-react'
import { exportarSorteioLeads, removerSorteioLead } from '@/lib/actions/sorteio'
import { AdminSectionCard } from '@/components/admin/section-card'
import { toast } from 'sonner'
import type { SorteioLead } from '@/lib/actions/sorteio'

interface Props {
  leads: SorteioLead[]
}

export function SorteioAdmin({ leads }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)
  const [winner, setWinner] = useState<SorteioLead | null>(null)
  const [sorting, setSorting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = leads.filter(
    (l) =>
      l.nome.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.whatsapp.includes(search)
  )

  function handleSortear() {
    setSorting(true)
    setTimeout(() => {
      const eligible = leads.filter((l) => l.nome.trim().length > 0 && !l.email.includes('@teste'))
      const drawn = eligible[Math.floor(Math.random() * eligible.length)]
      setWinner(drawn)
      setSorting(false)
    }, 1500)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const data = await exportarSorteioLeads()
      const csv = ['nome,whatsapp,email,data', ...data.map((l) => `"${l.nome.replace(/"/g, '""')}","${l.whatsapp}","${l.email}","${l.data}"`)].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sorteio-leads-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // erro silencioso
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete(lead: SorteioLead) {
    if (!confirm(`Remover "${lead.nome}" da lista de sorteio?`)) return

    setDeletingId(lead.id)
    try {
      await removerSorteioLead(lead.id)
      toast.success('Lead removido do sorteio!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover lead')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Controles do Sorteio"
        description="Busque, sorteie, exporte ou remova cadastros do sorteio."
      >
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou WhatsApp..."
              className="w-full rounded-xl border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              onClick={handleSortear}
              disabled={sorting || leads.length === 0}
              title={leads.length === 0 ? 'Nenhum lead cadastrado para sortear' : undefined}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/60 hover:bg-primary/5 disabled:opacity-50"
            >
              <Shuffle className="size-4 text-primary" />
              {sorting ? 'Sorteando...' : 'Sortear'}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || leads.length === 0}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              <Download className="size-4" />
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Guia rápida"
        description="Exporte o CSV e use um sorteador online se preferir uma seleção manual."
      >
        <a
          href="https://sorteador.com.br/sorteio-de-nomes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          sorteador.com.br/sorteio-de-nomes
          <ExternalLink className="size-3" />
        </a>
      </AdminSectionCard>

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setWinner(null)}>
          <div className="relative mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setWinner(null)}
              className="absolute right-3 top-3 rounded-md p-1 text-muted hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
            <Trophy className="mx-auto mb-4 size-16 text-yellow-500" />
            <p className="text-xs uppercase tracking-wider text-muted">Vencedor</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{winner.nome}</p>
            <p className="mt-1 text-sm text-muted">{winner.whatsapp}</p>
            <p className="text-sm text-muted">{winner.email}</p>
          </div>
        </div>
      )}

      <AdminSectionCard
        title="Leads do Sorteio"
        description={`${filtered.length} de ${leads.length} cadastros`}
      >
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
            <Gift className="mb-3 size-10 text-muted/40" aria-hidden="true" />
            <p className="text-sm text-muted">Nenhum cadastro no sorteio ainda.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <caption className="sr-only">Leads do sorteio</caption>
                <thead className="bg-card">
                  <tr className="text-left text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">Nome</th>
                    <th scope="col" className="px-4 py-3 font-medium">WhatsApp</th>
                    <th scope="col" className="px-4 py-3 font-medium">Email</th>
                    <th scope="col" className="px-4 py-3 font-medium">Data</th>
                    <th scope="col" className="px-4 py-3 font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((l) => (
                    <tr key={l.id} className="bg-background transition-colors hover:bg-card/50">
                      <td className="px-4 py-3 font-medium text-foreground">{l.nome}</td>
                      <td className="px-4 py-3 text-muted">{l.whatsapp}</td>
                      <td className="px-4 py-3 text-muted">{l.email}</td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(l.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(l)}
                          disabled={deletingId === l.id}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-3 py-2 text-xs text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                          title="Remover da lista"
                          aria-label={`Remover ${l.nome} da lista de sorteio`}
                        >
                          <Trash2 className="size-3.5" />
                          {deletingId === l.id ? 'Removendo...' : 'Excluir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminSectionCard>
    </div>
  )
}
