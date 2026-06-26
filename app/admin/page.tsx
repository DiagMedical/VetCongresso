import { BarChart3, Clock, TicketCheck, Users, UserMinus } from 'lucide-react'
import { AnimatedKpi } from '@/components/admin/animated-kpi'
import { DashboardCharts } from '@/components/admin/dashboard-charts'
import { DashboardActions } from '@/components/admin/dashboard-actions'
import { DashboardTabelaPalestras } from '@/components/admin/dashboard-tabela-palestras'
import { DashboardUltimosLeads } from '@/components/admin/dashboard-ultimos-leads'
import { BackToTop } from '@/components/back-to-top'
import { getDashboardData, listarPalestrasComVagas } from '@/lib/actions/admin'

export default async function AdminDashboard() {
  const [data, palestras] = await Promise.all([
    getDashboardData(),
    listarPalestrasComVagas(),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AnimatedKpi title="Total de Leads" value={data.total_leads} icon={<Users className="size-5" />} />
        <AnimatedKpi title="Check-ins Hoje" value={data.checkins_hoje} icon={<TicketCheck className="size-5" />} />
        <AnimatedKpi title="Palestras Ativas" value={data.palestras_ativas} icon={<BarChart3 className="size-5" />} />
        <AnimatedKpi title="Cancelamentos" value={data.cancelamentos} icon={<UserMinus className="size-5" />} />
        <AnimatedKpi title="Lista de Espera" value={data.espera} icon={<Clock className="size-5" />} />
      </div>

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
