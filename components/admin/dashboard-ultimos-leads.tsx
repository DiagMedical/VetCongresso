'use client'

import { Users } from 'lucide-react'
import type { DashboardData } from '@/lib/actions/admin'

interface Props {
  data: DashboardData
}

export function DashboardUltimosLeads({ data }: Props) {
  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border bg-card px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Últimos Leads</h3>
      </div>
      {data.ultimos_leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center" role="status" aria-live="polite">
          <Users className="mb-3 size-10 text-muted/40" />
          <p className="text-sm text-muted">Nenhum lead registrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Últimos 10 leads</caption>
            <thead className="bg-card">
              <tr className="text-left text-muted">
                <th scope="col" className="px-4 py-3 font-medium">Nome</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Palestra</th>
                <th scope="col" className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.ultimos_leads.map((lead, i) => (
                <tr key={i} className="bg-background hover:bg-card/50 hover:ring-1 hover:ring-accent/10 transition-all duration-200">
                  <td className="px-4 py-3 font-medium text-foreground">{lead.nome}</td>
                  <td className="px-4 py-3 text-muted">{lead.email}</td>
                  <td className="px-4 py-3 text-foreground">{lead.palestra}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(lead.created_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
