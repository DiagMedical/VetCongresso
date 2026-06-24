import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/admin/leads-table'
import { BackToTop } from '@/components/back-to-top'
import type { Inscrito } from '@/types'

export default async function LeadsPage() {
  const supabase = await createClient()

  const { data: inscritos } = await supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(*)')
    .order('created_at', { ascending: false })

  const { data: palestras } = await supabase
    .from('palestras')
    .select('id, tema')
    .order('dia_evento')
    .order('horario_inicio')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Leads</h2>
      <LeadsTable
        inscritos={(inscritos ?? []) as Inscrito[]}
        palestras={palestras ?? []}
      />
      <BackToTop />
    </div>
  )
}
