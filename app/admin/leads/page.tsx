import { createClient } from '@/lib/supabase/server'
import { LeadsTable, type LeadRow } from '@/components/admin/leads-table'
import { AdminPageHeader } from '@/components/admin/page-header'
import { BackToTop } from '@/components/back-to-top'
import { listarSorteioLeads } from '@/lib/actions/sorteio'
import type { Inscrito } from '@/types'

export default async function LeadsPage() {
  const supabase = await createClient()

  let inscritos, count, palestras, sorteioLeads
  try {
    const [inscritosResult, palestrasResult, sorteioResult] = await Promise.all([
      supabase
        .from('inscritos')
        .select('*, palestra:palestra_id(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, 999),
      supabase
        .from('palestras')
        .select('id, tema')
        .order('dia_evento')
        .order('horario_inicio'),
      listarSorteioLeads(),
    ])

    inscritos = inscritosResult.data
    count = inscritosResult.count
    palestras = palestrasResult.data
    sorteioLeads = sorteioResult
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar leads. Tente novamente.</p></div>
  }

  const leads: LeadRow[] = [
    ...((inscritos ?? []) as Inscrito[]).map((i) => ({
      id: i.id,
      nome: i.nome,
      email: i.email,
      telefone: i.telefone,
      created_at: i.created_at,
      origem: i.origem,
      status: i.status,
      palestra_id: i.palestra_id,
      palestra: i.palestra ? { id: i.palestra.id, tema: i.palestra.tema } : null,
      source: 'inscrito' as const,
    })),
    ...((sorteioLeads ?? []).map((l) => ({
      id: l.id,
      nome: l.nome,
      email: l.email,
      telefone: l.whatsapp,
      created_at: l.created_at,
      origem: 'sorteio',
      status: 'sorteio' as const,
      palestra_id: null,
      palestra: null,
      source: 'sorteio' as const,
    }))),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const totalCount = (count ?? 0) + (sorteioLeads?.length ?? 0)
  const limiteAtingido = (count ?? 0) > 1000

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Leads"
        description="Lista consolidada das reservas recebidas e dos cadastros do sorteio, com filtros, ordenação e exportação."
      />
      <LeadsTable
        leads={leads}
        palestras={palestras ?? []}
        totalCount={totalCount}
        limiteAtingido={limiteAtingido}
      />
      <BackToTop />
    </div>
  )
}
