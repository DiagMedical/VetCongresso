'use client'

import type { RelatoriosData } from '@/lib/actions/admin'

interface Props {
  data: RelatoriosData
}

export function RelatoriosTabela({ data }: Props) {
  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border bg-card px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Detalhamento por Palestra</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Detalhamento por Palestra</caption>
          <thead className="bg-card">
            <tr className="text-left text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Palestra</th>
              <th scope="col" className="px-4 py-3 font-medium">Palestrante</th>
              <th scope="col" className="px-4 py-3 font-medium">Dia</th>
              <th scope="col" className="px-4 py-3 font-medium">Vagas</th>
              <th scope="col" className="px-4 py-3 font-medium">Reservas</th>
              <th scope="col" className="px-4 py-3 font-medium">Check-ins</th>
              <th scope="col" className="px-4 py-3 font-medium">Cancelados</th>
              <th scope="col" className="px-4 py-3 font-medium">Espera</th>
              <th scope="col" className="px-4 py-3 font-medium">Ocupação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.por_palestra.map((p) => (
              <tr key={p.palestra_id} className="bg-background hover:bg-card/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{p.tema}</td>
                <td className="px-4 py-3 text-muted">{p.palestrante}</td>
                <td className="px-4 py-3 text-foreground">{p.dia}</td>
                <td className="px-4 py-3 text-foreground">{p.vagas}</td>
                <td className="px-4 py-3 text-foreground">{p.reservas}</td>
                <td className="px-4 py-3 text-foreground">{p.checkins}</td>
                <td className="px-4 py-3 text-foreground">{p.cancelados}</td>
                <td className="px-4 py-3 text-foreground">{p.espera}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={`h-full rounded-full ${
                          p.taxa_ocupacao >= 80
                            ? 'bg-success'
                            : p.taxa_ocupacao >= 50
                            ? 'bg-primary'
                            : 'bg-danger'
                        }`}
                        style={{ width: `${p.taxa_ocupacao}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted">{p.taxa_ocupacao}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
