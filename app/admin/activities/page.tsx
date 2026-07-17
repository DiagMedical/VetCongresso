import { createServiceClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/page-header'
import { ActivitiesTimeline } from './activities-timeline'
import type { Activity } from '@/types'

export default async function ActivitiesPage() {
  let data: Activity[], total: number
  try {
    const supabase = createServiceClient()
    const { data: activities, count, error } = await supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .order('data_atividade', { ascending: false })
      .limit(200)

    if (error) throw error
    data = (activities ?? []) as Activity[]
    total = count ?? 0
  } catch {
    return (
      <div className="space-y-6 p-6">
        <p className="text-muted">Erro ao carregar atividades. Tente novamente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Atividades"
        description={`${total} atividade${total !== 1 ? 's' : ''} registrada${total !== 1 ? 's' : ''}`}
      />
      <ActivitiesTimeline activities={data} />
    </div>
  )
}
