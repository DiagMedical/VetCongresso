'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, BookOpen } from 'lucide-react'
import type { DashboardData } from '@/lib/actions/admin'

interface Props {
  data: DashboardData
}

function SetaIcon({ ordem, col }: { ordem: { col: string; dir: string }; col: string }) {
  if (ordem.col !== col) return <ArrowUpDown className="ml-1 inline size-3 text-muted/40" />
  return ordem.dir === 'asc'
    ? <ArrowUp className="ml-1 inline size-3 text-primary" />
    : <ArrowDown className="ml-1 inline size-3 text-primary" />
}

export function DashboardTabelaPalestras({ data }: Props) {
  const [ordem, setOrdem] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'reservas', dir: 'desc' })

  function toggleOrdem(col: string) {
    setOrdem((prev) => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  const ordenados = useMemo(() => {
    const lista = [...data.reservas_por_palestra]
    lista.sort((a, b) => {
      let cmp = 0
      switch (ordem.col) {
        case 'tema': cmp = a.tema.localeCompare(b.tema); break
        case 'palestrante': cmp = a.palestrante.localeCompare(b.palestrante); break
        case 'vagas': cmp = a.vagas - b.vagas; break
        case 'reservas': cmp = a.reservas - b.reservas; break
        case 'checkins': cmp = a.checkins - b.checkins; break
        case 'taxa_checkin': cmp = a.taxa_checkin - b.taxa_checkin; break
        case 'taxa_ocupacao': cmp = a.taxa_ocupacao - b.taxa_ocupacao; break
      }
      return ordem.dir === 'asc' ? cmp : -cmp
    })
    return lista
  }, [data.reservas_por_palestra, ordem])

  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border bg-card px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Resumo por Palestra</h3>
      </div>
      {ordenados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
          <BookOpen className="mx-auto mb-3 size-10 text-muted/40" />
          <p className="text-sm font-medium text-foreground">Nenhuma palestra encontrada</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Resumo por Palestra</caption>
            <thead className="bg-card">
              <tr className="text-left text-muted">
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('tema')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Palestra <SetaIcon ordem={ordem} col="tema" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('palestrante')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Palestrante <SetaIcon ordem={ordem} col="palestrante" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('vagas')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Vagas <SetaIcon ordem={ordem} col="vagas" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('reservas')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Inscritos <SetaIcon ordem={ordem} col="reservas" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('checkins')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Check-ins <SetaIcon ordem={ordem} col="checkins" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('taxa_checkin')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    % Check-in <SetaIcon ordem={ordem} col="taxa_checkin" />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <button onClick={() => toggleOrdem('taxa_ocupacao')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    % Ocupação <SetaIcon ordem={ordem} col="taxa_ocupacao" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ordenados.map((p) => (
                <tr key={p.palestra_id} className="bg-background hover:bg-card/50 hover:ring-1 hover:ring-accent/10 transition-all duration-200">
                  <td className="px-4 py-3 font-medium text-foreground">{p.tema}</td>
                  <td className="px-4 py-3 text-muted">{p.palestrante}</td>
                  <td className="px-4 py-3 text-foreground">{p.vagas}</td>
                  <td className="px-4 py-3 text-foreground">{p.reservas}</td>
                  <td className="px-4 py-3 text-foreground">{p.checkins}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted/30">
                        <div
                          className={`h-full rounded-full ${
                            p.taxa_checkin >= 70
                              ? 'bg-success'
                              : p.taxa_checkin >= 40
                              ? 'bg-primary'
                              : 'bg-danger'
                          }`}
                          style={{ width: `${p.taxa_checkin}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted">{p.taxa_checkin}%</span>
                    </div>
                  </td>
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
      )}
    </div>
  )
}
