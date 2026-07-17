import { createServiceClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/page-header'
import { DealsKanban } from './deals-kanban'
import type { Deal, PipelineStage } from '@/types'

export default async function DealsPage() {
  let deals: Deal[], stages: PipelineStage[]
  try {
    const supabase = createServiceClient()
    const [dealsRes, stagesRes] = await Promise.all([
      supabase
        .from('deals')
        .select('*, contact:contacts(*), stage:pipeline_stages(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('pipeline_stages')
        .select('*')
        .order('ordem', { ascending: true }),
    ])

    if (dealsRes.error) throw dealsRes.error
    if (stagesRes.error) throw stagesRes.error

    deals = (dealsRes.data ?? []) as Deal[]
    stages = (stagesRes.data ?? []) as PipelineStage[]
  } catch {
    return (
      <div className="space-y-6 p-6">
        <p className="text-muted">Erro ao carregar pipeline. Tente novamente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pipeline"
        description={`${deals.length} deal${deals.length !== 1 ? 's' : ''} · ${stages.length} estágios`}
      />
      <DealsKanban deals={deals} stages={stages} />
    </div>
  )
}
