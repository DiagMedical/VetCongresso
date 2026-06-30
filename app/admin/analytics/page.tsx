import { getAnalyticsData } from '@/lib/actions/admin'
import { AnalyticsCharts } from './analytics-charts'
import { AnalyticsKpis } from './analytics-kpis'
import { AdminPageHeader } from '@/components/admin/page-header'

export default async function AnalyticsPage() {
  let data
  try {
    data = await getAnalyticsData()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar analytics. Tente novamente.</p></div>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Indicadores de comportamento, previsões e ocupação para apoiar decisões rápidas."
      />

      <AnalyticsKpis data={data} />
      <AnalyticsCharts data={data} />
    </div>
  )
}
