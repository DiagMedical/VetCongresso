import { Users, Kanban, DollarSign, TrendingUp, Target, Award, BarChart3, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { AnimatedKpi } from '@/components/admin/animated-kpi'
import { AdminPageHeader } from '@/components/admin/page-header'
import { BackToTop } from '@/components/back-to-top'
import { getCrmDashboardData } from '@/lib/actions/crm'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  let data
  try {
    data = await getCrmDashboardData()
  } catch {
    data = {
      total_contatos: 0,
      deals_abertos: 0,
      valor_pipeline: 0,
      valor_pipeline_ponderado: 0,
      taxa_conversao: 0,
      deals_fechados_mes: 0,
      deals_por_stage: [],
      ranking_vendedores: [],
      deals_recentes: [],
      atividades_recentes: [],
      leads_sem_followup: [],
      deals_parados: [],
      tempo_medio_por_stage: [],
    }
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Visão geral do CRM com pipeline, vendas e atividades."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AnimatedKpi title="Total de Contatos" value={data.total_contatos} icon={<Users className="size-5" />} gradient="primary" className="animate-glow" />
        <AnimatedKpi title="Deals Abertos" value={data.deals_abertos} icon={<Kanban className="size-5" />} gradient="cyan" />
        <AnimatedKpi title="Pipeline Total" value={fmt(data.valor_pipeline)} icon={<DollarSign className="size-5" />} gradient="purple" />
        <AnimatedKpi title="Pipeline Ponderado" value={fmt(data.valor_pipeline_ponderado)} icon={<BarChart3 className="size-5" />} gradient="cyan" />
        <AnimatedKpi title="Taxa de Conversão" value={`${data.taxa_conversao}%`} icon={<TrendingUp className="size-5" />} gradient="green" />
        <AnimatedKpi title="Fechados no Mês" value={data.deals_fechados_mes} icon={<Target className="size-5" />} gradient="rose" />
      </div>

      {/* Pipeline Ponderado + Ranking de Vendedores */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funil de Conversão */}
        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm animate-fade-in-1">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Funil de Conversão</h3>
          {data.deals_por_stage.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Nenhum deal cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {data.deals_por_stage.map(stage => {
                const maxValor = Math.max(...data.deals_por_stage.map(s => s.valor), 1)
                const pct = (stage.valor / maxValor) * 100
                return (
                  <div key={stage.stage_id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{stage.stage_nome}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{stage.total} deals</span>
                      </div>
                      <span className="text-xs text-muted">{fmt(stage.valor)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%`, opacity: 0.3 + (pct / 100) * 0.7 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Ranking de Vendedores */}
        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm animate-fade-in-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Ranking de Vendedores</h3>
            <Award className="size-4 text-accent" />
          </div>
          {data.ranking_vendedores.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Nenhum vendedor com deals.</p>
          ) : (
            <div className="space-y-3">
              {data.ranking_vendedores.map((item, idx) => {
                const maxValor = Math.max(...data.ranking_vendedores.map(v => v.valor_total), 1)
                const pct = (item.valor_total / maxValor) * 100
                return (
                  <div key={item.vendedor} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                          idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-border text-muted'
                        }`}>{idx + 1}</span>
                        <span className="text-foreground font-medium">{item.vendedor}</span>
                        <span className="text-xs text-muted">({item.total_deals} deals)</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{fmt(item.valor_total)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Deals Recentes */}
      <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm animate-fade-in-3">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Deals Recentes</h3>
        {data.deals_recentes.length === 0 ? (
          <p className="text-sm text-muted/60 py-4 text-center">Nenhum deal cadastrado ainda.</p>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[600px] w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-primary/[0.03]">
                    <th className="px-3 py-2.5 text-left font-medium text-muted text-xs uppercase tracking-wider">Título</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted text-xs uppercase tracking-wider hidden sm:table-cell">Contato</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted text-xs uppercase tracking-wider">Estágio</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted text-xs uppercase tracking-wider hidden md:table-cell">Valor</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted text-xs uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.deals_recentes.map(deal => (
                    <tr key={deal.id} className="border-b border-border hover:ring-1 hover:ring-accent/10 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-foreground truncate max-w-[200px]">{deal.titulo}</td>
                      <td className="px-3 py-2.5 text-muted truncate max-w-[150px] hidden sm:table-cell">
                        {deal.contact?.nome ?? <span className="text-muted/40">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {deal.stage?.nome ?? '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-foreground font-medium hidden md:table-cell">
                        {deal.valor > 0 ? fmt(deal.valor) : <span className="text-muted/40">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-muted whitespace-nowrap">{formatDate(deal.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden space-y-3">
              {data.deals_recentes.map(deal => (
                <div key={deal.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate flex-1">{deal.titulo}</p>
                    {deal.valor > 0 && (
                      <span className="text-sm font-semibold text-foreground shrink-0">{fmt(deal.valor)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {deal.stage?.nome ?? '—'}
                    </span>
                    {deal.contact?.nome && (
                      <span>{deal.contact.nome}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted">
                    {formatDate(deal.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Ações Rápidas */}
      {/* Tempo Médio no Pipeline */}
      <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm animate-fade-in-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">⏱️ Tempo Médio no Pipeline</h3>
        {data.tempo_medio_por_stage.length === 0 ? (
          <p className="text-sm text-muted/60 py-4 text-center">Sem dados suficientes.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.tempo_medio_por_stage.map(stage => (
              <div key={stage.stage_id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted">{stage.stage_nome}</p>
                <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                  {stage.dias_medio}
                  <span className="text-sm font-normal text-muted ml-1">dias</span>
                </p>
                <p className="text-xs text-muted/60 mt-1">{stage.total_deals} deals</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads sem Follow-up */}
        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm animate-fade-in-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            Leads sem Follow-up
          </h3>
          {data.leads_sem_followup.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Todas as leads tiveram contato!</p>
          ) : (
            <div className="space-y-3">
              {data.leads_sem_followup.map(lead => (
                <Link key={lead.id} href="/admin/contacts" className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 hover:ring-1 hover:ring-accent/20 transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{lead.nome}</p>
                    <p className="text-xs text-muted truncate">{lead.email ?? lead.telefone ?? '—'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {lead.empresa && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          lead.empresa === 'vet' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                        }`}>{lead.empresa === 'vet' ? 'Vet' : 'Humana'}</span>
                      )}
                      {lead.evento && <span className="text-[10px] text-muted">{lead.evento}</span>}
                    </div>
                  </div>
                  <ExternalLink className="size-3 text-muted/30 group-hover:text-accent transition-colors shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Deals Parados */}
        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm animate-fade-in-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-yellow-500 animate-pulse" />
            Deals Parados
          </h3>
          {data.deals_parados.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Nenhum deal parado!</p>
          ) : (
            <div className="space-y-3">
              {data.deals_parados.map(deal => (
                <Link key={deal.id} href="/admin/deals" className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 hover:ring-1 hover:ring-accent/20 transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{deal.titulo}</p>
                    <p className="text-xs text-muted">{deal.contact?.nome ?? 'Sem contato'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {deal.stage?.nome ?? '—'}
                      </span>
                      <span className="text-[10px] text-yellow-400 font-medium">
                        {deal.dias_parado}d parado
                      </span>
                      {deal.valor > 0 && (
                        <span className="text-[10px] text-muted">{fmt(deal.valor)}</span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="size-3 text-muted/30 group-hover:text-accent transition-colors shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Atividades Recentes */}
      <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm animate-fade-in-7">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Atividades Recentes</h3>
        </div>
        {data.atividades_recentes.length === 0 ? (
          <p className="text-sm text-muted/60 py-4 text-center">Nenhuma atividade recente.</p>
        ) : (
          <div className="space-y-3">
            {data.atividades_recentes.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase shrink-0">
                  {activity.tipo}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">{activity.descricao}</p>
                  {activity.responsavel && (
                    <p className="mt-0.5 text-xs text-muted">{activity.responsavel}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <BackToTop />
    </div>
  )
}
