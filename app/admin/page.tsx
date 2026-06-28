import { BarChart3, Clock, TicketCheck, Users, UserMinus } from 'lucide-react'
import { AnimatedKpi } from '@/components/admin/animated-kpi'
import { DashboardCharts } from '@/components/admin/dashboard-charts'
import { DashboardActions } from '@/components/admin/dashboard-actions'
import { DashboardTabelaPalestras } from '@/components/admin/dashboard-tabela-palestras'
import { DashboardUltimosLeads } from '@/components/admin/dashboard-ultimos-leads'
import { DashboardFiltroData } from '@/components/admin/dashboard-filtro-data'
import { DashboardResumoIA } from '@/components/admin/dashboard-resumo-ia'
import { BackToTop } from '@/components/back-to-top'
import { getDashboardData, listarPalestrasComVagas } from '@/lib/actions/admin'
import type { DashboardData } from '@/lib/actions/admin'
import type { Palestra } from '@/types'

export default async function AdminDashboard(props: { searchParams?: Promise<{ dia?: string }> }) {
  const searchParams = await props.searchParams
  const diaFiltro = searchParams?.dia ? Number(searchParams.dia) : undefined
  let data: DashboardData
  let palestras: Palestra[]
  try {
    ;[data, palestras] = await Promise.all([
      getDashboardData(diaFiltro),
      listarPalestrasComVagas(),
    ])
  } catch {
    data = { total_leads: 0, checkins_hoje: 0, palestras_ativas: 0, cancelamentos: 0, espera: 0, reservas_por_palestra: [], reservas_por_dia: [], ranking_palestrantes: [], ultimos_leads: [] }
    palestras = []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <DashboardFiltroData />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AnimatedKpi title="Total de Leads" value={data.total_leads} icon={<Users className="size-5" />} className="animate-glow" />
        <AnimatedKpi title="Check-ins Hoje" value={data.checkins_hoje} icon={<TicketCheck className="size-5" />} />
        <AnimatedKpi title="Palestras Ativas" value={data.palestras_ativas} icon={<BarChart3 className="size-5" />} />
        <AnimatedKpi title="Cancelamentos" value={data.cancelamentos} icon={<UserMinus className="size-5" />} />
        <AnimatedKpi title="Lista de Espera" value={data.espera} icon={<Clock className="size-5" />} />
      </div>

      <DashboardResumoIA data={data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCharts data={data} />
        <DashboardActions palestras={palestras} />
      </div>

      <DashboardTabelaPalestras data={data} />
      <DashboardUltimosLeads data={data} />
      <BackToTop />
    </div>
  )
}
