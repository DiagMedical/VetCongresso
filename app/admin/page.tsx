import { Users, Kanban, DollarSign, TrendingUp, Target } from 'lucide-react'
import { AnimatedKpi } from '@/components/admin/animated-kpi'
import { AdminPageHeader } from '@/components/admin/page-header'
import { BackToTop } from '@/components/back-to-top'
import { getCrmDashboardData } from '@/lib/actions/crm'

export default async function AdminDashboard() {
  let data
  try {
    data = await getCrmDashboardData()
  } catch {
    data = {
      total_contatos: 0,
      deals_abertos: 0,
      valor_pipeline: 0,
      taxa_conversao: 0,
      deals_fechados_mes: 0,
      contatos_por_vendedor: [],
      deals_por_stage: [],
      leads_por_origem: [],
      atividades_recentes: [],
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Visão geral do CRM com contatos, pipeline e conversão."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <AnimatedKpi
          title="Total de Contatos"
          value={data.total_contatos}
          icon={<Users className="size-5" />}
          className="animate-glow"
        />
        <AnimatedKpi
          title="Deals Abertos"
          value={data.deals_abertos}
          icon={<Kanban className="size-5" />}
        />
        <AnimatedKpi
          title="Valor do Pipeline"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
          }).format(data.valor_pipeline)}
          icon={<DollarSign className="size-5" />}
        />
        <AnimatedKpi
          title="Taxa de Conversão"
          value={`${data.taxa_conversao}%`}
          icon={<TrendingUp className="size-5" />}
        />
        <AnimatedKpi
          title="Fechados no Mês"
          value={data.deals_fechados_mes}
          icon={<Target className="size-5" />}
        />
      </div>

      {/* Pipeline por estágio */}
      <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Deals por Estágio</h3>
        {data.deals_por_stage.length === 0 ? (
          <p className="text-sm text-muted/60 py-4 text-center">Nenhum deal cadastrado.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.deals_por_stage.map(stage => (
              <div
                key={stage.stage_id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{stage.stage_nome}</span>
                  <span className="text-lg font-bold text-foreground">{stage.total}</span>
                </div>
                <p className="text-xs text-muted">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(stage.valor)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contatos por vendedor & Origem */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Contatos por Vendedor</h3>
          {data.contatos_por_vendedor.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Nenhum vendedor com contatos.</p>
          ) : (
            <div className="space-y-3">
              {data.contatos_por_vendedor.map(item => {
                const max = Math.max(...data.contatos_por_vendedor.map(c => c.total))
                const pct = (item.total / max) * 100
                return (
                  <div key={item.vendedor} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.vendedor}</span>
                      <span className="text-muted">{item.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Leads por Origem</h3>
          {data.leads_por_origem.length === 0 ? (
            <p className="text-sm text-muted/60 py-4 text-center">Nenhuma origem registrada.</p>
          ) : (
            <div className="space-y-3">
              {data.leads_por_origem.map(item => {
                const max = Math.max(...data.leads_por_origem.map(l => l.total))
                const pct = (item.total / max) * 100
                return (
                  <div key={item.origem} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground capitalize">{item.origem}</span>
                      <span className="text-muted">{item.total}</span>
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

      {/* Atividades Recentes */}
      <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Atividades Recentes</h3>
        </div>
        {data.atividades_recentes.length === 0 ? (
          <p className="text-sm text-muted/60 py-4 text-center">Nenhuma atividade recente.</p>
        ) : (
          <div className="space-y-3">
            {data.atividades_recentes.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                  {activity.tipo}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                    {activity.descricao}
                  </p>
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
