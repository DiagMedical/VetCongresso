import { getAnalyticsData } from '@/lib/actions/admin'
import { AnalyticsCharts } from './analytics-charts'
import { AnalyticsKpis } from './analytics-kpis'

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>

      <AnalyticsKpis data={data} />
      <AnalyticsCharts data={data} />
    </div>
  )
}
