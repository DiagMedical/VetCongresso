import { Users, Target, Stethoscope, Syringe } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { KpiCard } from '@/components/admin/kpi-card'
import { BotaoExportarPDF } from '@/components/admin/botao-exportar-pdf'
import { BotaoExportarXLSX } from '@/components/admin/botao-exportar-xlsx'
import { AdminPageHeader } from '@/components/admin/page-header'
import { BackToTop } from '@/components/back-to-top'

export default async function RelatoriosPage() {
  const supabase = createServiceClient()

  let totalLeads = 0, leadsVet = 0, leadsHumana = 0, totalDeals = 0
  let leadsPorEvento: { evento: string; total: number }[] = []
  const interessesVetCount: Record<string, number> = {}
  const interessesHumanoCount: Record<string, number> = {}

  try {
    const [contatosRes, dealsRes] = await Promise.all([
      supabase.from('contacts').select('empresa, evento, interesses_vet, interesses_humano'),
      supabase.from('deals').select('id', { count: 'exact', head: true }),
    ])

    const contatos = contatosRes.data ?? []
    totalLeads = contatos.length
    leadsVet = contatos.filter(c => c.empresa === 'vet').length
    leadsHumana = contatos.filter(c => c.empresa === 'humana').length

    const eventoMap: Record<string, number> = {}
    contatos.forEach(c => { if (c.evento) eventoMap[c.evento] = (eventoMap[c.evento] || 0) + 1 })
    leadsPorEvento = Object.entries(eventoMap).map(([evento, total]) => ({ evento, total })).sort((a, b) => b.total - a.total)

    contatos.forEach(c => {
      (c.interesses_vet ?? []).forEach((i: string) => interessesVetCount[i] = (interessesVetCount[i] || 0) + 1)
      ;(c.interesses_humano ?? []).forEach((i: string) => interessesHumanoCount[i] = (interessesHumanoCount[i] || 0) + 1)
    })

    totalDeals = dealsRes.count ?? 0
  } catch {
    // fallback
  }

  const topInteressesVet = Object.entries(interessesVetCount).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topInteressesHumano = Object.entries(interessesHumanoCount).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const dadosXLSX = leadsPorEvento.map(l => ({ Evento: l.evento, Leads: l.total }))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Relatórios"
        description="Visão geral do CRM com leads, conversão e interesses."
        actions={
          <>
            <BotaoExportarXLSX data={dadosXLSX} filename="relatorio-crm" />
            <BotaoExportarPDF containerId="relatorio-conteudo" filename="relatorio-crm" />
          </>
        }
      />

      <div id="relatorio-conteudo" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total de Leads" value={totalLeads} icon={<Users className="size-5" />} />
          <KpiCard title="Diagnostic Vet" value={leadsVet} icon={<Stethoscope className="size-5" />} />
          <KpiCard title="Diagnostic Medical" value={leadsHumana} icon={<Syringe className="size-5" />} />
          <KpiCard title="Total de Deals" value={totalDeals} icon={<Target className="size-5" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Leads por Evento</h3>
            {leadsPorEvento.length === 0 ? (
              <p className="text-sm text-muted/60 py-4 text-center">Nenhum evento cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {leadsPorEvento.map(item => {
                  const max = Math.max(...leadsPorEvento.map(l => l.total), 1)
                  const pct = (item.total / max) * 100
                  return (
                    <div key={item.evento} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{item.evento}</span>
                        <span className="text-muted">{item.total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Interesses mais Comuns</h3>
            {topInteressesVet.length === 0 && topInteressesHumano.length === 0 ? (
              <p className="text-sm text-muted/60 py-4 text-center">Nenhum interesse registrado.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1"><Stethoscope className="size-3" /> Veterinária</p>
                  {topInteressesVet.length === 0 ? (
                    <p className="text-xs text-muted/60">Nenhum</p>
                  ) : (
                    <div className="space-y-2">
                      {topInteressesVet.map(([item, total]) => (
                        <div key={item} className="flex items-center justify-between text-xs">
                          <span className="text-muted truncate max-w-[120px]">{item}</span>
                          <span className="text-foreground font-medium ml-2">{total}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1"><Syringe className="size-3" /> Humana</p>
                  {topInteressesHumano.length === 0 ? (
                    <p className="text-xs text-muted/60">Nenhum</p>
                  ) : (
                    <div className="space-y-2">
                      {topInteressesHumano.map(([item, total]) => (
                        <div key={item} className="flex items-center justify-between text-xs">
                          <span className="text-muted truncate max-w-[120px]">{item}</span>
                          <span className="text-foreground font-medium ml-2">{total}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <BackToTop />
    </div>
  )
}
