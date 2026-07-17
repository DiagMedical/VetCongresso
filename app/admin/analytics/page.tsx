import { Users, BarChart3, Target } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { AnimatedKpi } from '@/components/admin/animated-kpi'
import { AdminPageHeader } from '@/components/admin/page-header'
import { BackToTop } from '@/components/back-to-top'

export default async function AnalyticsPage() {
  const supabase = createServiceClient()

  let totalLeads = 0, totalVet = 0, totalHumana = 0
  let leadsPorDia: { dia: string; total: number }[] = []
  let leadsPorVendedor: { vendedor: string; total: number }[] = []
  let dealsPorVendedor: { vendedor: string; total: number }[] = []

  try {
    const [contatosRes, dealsRes] = await Promise.all([
      supabase.from('contacts').select('empresa, vendedor, created_at').order('created_at', { ascending: false }),
      supabase.from('deals').select('vendedor'),
    ])

    const contatos = contatosRes.data ?? []
    totalLeads = contatos.length
    totalVet = contatos.filter(c => c.empresa === 'vet').length
    totalHumana = contatos.filter(c => c.empresa === 'humana').length

    // Leads por dia (últimos 30 dias)
    const diaMap: Record<string, number> = {}
    const agora = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(agora.getTime() - i * 86400000)
      diaMap[d.toISOString().slice(0, 10)] = 0
    }
    contatos.forEach(c => {
      const d = c.created_at?.slice(0, 10)
      if (d && diaMap[d] !== undefined) diaMap[d]++
    })
    leadsPorDia = Object.entries(diaMap).map(([dia, total]) => ({ dia, total })).sort((a, b) => a.dia.localeCompare(b.dia))

    // Leads por vendedor
    const vendedorMap: Record<string, number> = {}
    contatos.forEach(c => { if (c.vendedor) vendedorMap[c.vendedor] = (vendedorMap[c.vendedor] || 0) + 1 })
    leadsPorVendedor = Object.entries(vendedorMap).map(([vendedor, total]) => ({ vendedor, total })).sort((a, b) => b.total - a.total)

    // Deals por vendedor
    const dealsVendedorMap: Record<string, number> = {}
    ;(dealsRes.data ?? []).forEach((d: { vendedor: string | null }) => { if (d.vendedor) dealsVendedorMap[d.vendedor] = (dealsVendedorMap[d.vendedor] || 0) + 1 })
    dealsPorVendedor = Object.entries(dealsVendedorMap).map(([vendedor, total]) => ({ vendedor, total })).sort((a, b) => b.total - a.total)
  } catch {
    // fallback
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Indicadores de crescimento e distribuição de leads."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatedKpi title="Total de Leads" value={totalLeads} icon={<Users className="size-5" />} className="animate-glow" />
        <AnimatedKpi title="Diagnostic Vet" value={totalVet} icon={<BarChart3 className="size-5" />} />
        <AnimatedKpi title="Diagnostic Medical" value={totalHumana} icon={<BarChart3 className="size-5" />} />
        <AnimatedKpi title="Vendedores Ativos" value={leadsPorVendedor.length} icon={<Target className="size-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads por Dia (últimos 30 dias) */}
        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Leads por Dia (últimos 30 dias)</h3>
          {leadsPorDia.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Sem dados.</p>
          ) : (
            <div className="space-y-1">
              {leadsPorDia.map(item => {
                const max = Math.max(...leadsPorDia.map(l => l.total), 1)
                const pct = (item.total / max) * 100
                return (
                  <div key={item.dia} className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-right text-muted shrink-0">{item.dia.slice(5)}</span>
                    <div className="flex-1 h-4 rounded bg-border overflow-hidden">
                      <div className="h-full rounded bg-primary transition-all" style={{ width: `${Math.max(pct, item.total > 0 ? 5 : 0)}%` }} />
                    </div>
                    <span className="w-6 text-right text-foreground font-medium">{item.total}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Leads por Vendedor */}
        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Leads por Vendedor</h3>
          {leadsPorVendedor.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Nenhum vendedor.</p>
          ) : (
            <div className="space-y-3">
              {leadsPorVendedor.map(item => {
                const max = Math.max(...leadsPorVendedor.map(l => l.total), 1)
                const pct = (item.total / max) * 100
                return (
                  <div key={item.vendedor} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.vendedor}</span>
                      <span className="text-muted">{item.total} leads</span>
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

        {/* Deals por Vendedor */}
        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Deals por Vendedor</h3>
          {dealsPorVendedor.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Nenhum deal por vendedor.</p>
          ) : (
            <div className="space-y-3">
              {dealsPorVendedor.map(item => {
                const max = Math.max(...dealsPorVendedor.map(l => l.total), 1)
                const pct = (item.total / max) * 100
                return (
                  <div key={item.vendedor} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.vendedor}</span>
                      <span className="text-muted">{item.total} deals</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <BackToTop />
    </div>
  )
}
