'use client'

import { useState } from 'react'
import { Gift, Download, Search, ExternalLink, Shuffle, Trophy, X } from 'lucide-react'
import { exportarSorteioLeads } from '@/lib/actions/sorteio'
import type { SorteioLead } from '@/lib/actions/sorteio'

interface Props {
  leads: SorteioLead[]
}

export function SorteioAdmin({ leads }: Props) {
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)
  const [winner, setWinner] = useState<SorteioLead | null>(null)
  const [sorting, setSorting] = useState(false)

  const filtered = leads.filter(
    (l) =>
      l.nome.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.whatsapp.includes(search)
  )

  function handleSortear() {
    setSorting(true)
    setTimeout(() => {
      const eligible = leads.filter((l) => !l.nome.includes('@') || l.nome.trim().length > 0)
      const drawn = eligible[Math.floor(Math.random() * eligible.length)]
      setWinner(drawn)
      setSorting(false)
    }, 1500)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const data = await exportarSorteioLeads()
      const csv = ['nome,whatsapp,email,data', ...data.map((l) => `"${l.nome}","${l.whatsapp}","${l.email}","${l.data}"`)].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sorteio-leads-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou WhatsApp..."
            className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSortear}
            disabled={sorting || leads.length === 0}
            className="flex items-center gap-2 rounded-md border-2 border-primary/30 bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/60 hover:bg-primary/5 transition-all disabled:opacity-50"
          >
            <Shuffle className="size-4 text-primary" />
            {sorting ? 'Sorteando...' : 'Sortear'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || leads.length === 0}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Download className="size-4" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs text-muted">
          Exporte o CSV e use um sorteador online:
        </p>
        <a
          href="https://sorteador.com.br/sorteio-de-nomes"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          sorteador.com.br/sorteio-de-nomes
          <ExternalLink className="size-3" />
        </a>
      </div>

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
            <p className="text-xs text-muted uppercase tracking-wider">Vencedor</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{winner.nome}</p>
            <p className="mt-1 text-sm text-muted">{winner.whatsapp}</p>
            <p className="text-sm text-muted">{winner.email}</p>
          </div>
        </div>
      )}

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12 text-center">
          <Gift className="mb-3 size-10 text-muted/40" aria-hidden="true" />
          <p className="text-sm text-muted">Nenhum cadastro no sorteio ainda.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted">{filtered.length} de {leads.length} cadastros</p>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Leads do sorteio</caption>
                <thead className="bg-card">
                  <tr className="text-left text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">Nome</th>
                    <th scope="col" className="px-4 py-3 font-medium">WhatsApp</th>
                    <th scope="col" className="px-4 py-3 font-medium">Email</th>
                    <th scope="col" className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((l) => (
                    <tr key={l.id} className="bg-background hover:bg-card/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{l.nome}</td>
                      <td className="px-4 py-3 text-muted">{l.whatsapp}</td>
                      <td className="px-4 py-3 text-muted">{l.email}</td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(l.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
