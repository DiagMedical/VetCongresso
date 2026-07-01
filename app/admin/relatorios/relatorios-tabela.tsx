'use client'

import { BarChart3 } from 'lucide-react'
import type { RelatoriosData } from '@/lib/actions/admin'
import { AdminSectionCard } from '@/components/admin/section-card'

interface Props {
  data: RelatoriosData
}

export function RelatoriosTabela({ data }: Props) {
  return (
    <AdminSectionCard
      title="Detalhamento por Palestra"
      description="Tabela completa com vagas, reservas, check-ins, cancelamentos e ocupação por palestra."
      bodyClassName="p-0"
    >
      {data.por_palestra.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
          <BarChart3 className="mx-auto mb-3 size-10 text-muted/40" />
          <p className="text-sm font-medium text-foreground">Nenhuma palestra encontrada</p>
        </div>
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden md:block overflow-x-auto">
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

          {/* Mobile: card view */}
          <div className="md:hidden divide-y divide-border">
            {data.por_palestra.map((p) => (
              <div key={p.palestra_id} className="space-y-3 p-4">
                <div>
                  <div className="font-medium text-foreground">{p.tema}</div>
                  <div className="text-sm text-muted">{p.palestrante}</div>
                  <div className="text-xs text-muted">Dia {p.dia}</div>
                </div>
                {/* Métricas em grid 2 colunas */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Vagas</span>
                    <span className="font-medium text-foreground">{p.vagas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Reservas</span>
                    <span className="font-medium text-foreground">{p.reservas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Check-ins</span>
                    <span className="font-medium text-foreground">{p.checkins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Cancelados</span>
                    <span className="font-medium text-foreground">{p.cancelados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Espera</span>
                    <span className="font-medium text-foreground">{p.espera}</span>
                  </div>
                </div>
                {/* Ocupação */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted">Ocupação</span>
                    <span className="font-medium text-foreground">{p.taxa_ocupacao}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/30">
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
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminSectionCard>
  )
}
