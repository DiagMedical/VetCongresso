import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/admin/leads-table'
import { BackToTop } from '@/components/back-to-top'
import type { Inscrito } from '@/types'

export default async function LeadsPage() {
  const supabase = await createClient()

  let inscritos, count, palestras
  try {
    const result = await supabase
      .from('inscritos')
      .select('*, palestra:palestra_id(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 999)

    inscritos = result.data
    count = result.count

    const palestrasResult = await supabase
      .from('palestras')
      .select('id, tema')
      .order('dia_evento')
      .order('horario_inicio')

    palestras = palestrasResult.data
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar leads. Tente novamente.</p></div>
  }

  const limiteAtingido = (count ?? 0) > 1000

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Leads</h2>
      <LeadsTable
        inscritos={(inscritos ?? []) as Inscrito[]}
        palestras={palestras ?? []}
        totalCount={count ?? 0}
        limiteAtingido={limiteAtingido}
      />
      <BackToTop />
    </div>
  )
}
