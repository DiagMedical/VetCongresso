import { createServiceClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/page-header'
import { EventosClient } from './eventos-client'
import type { Evento } from '@/types'

export default async function EventosPage() {
  const supabase = createServiceClient()

  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*, total_contacts:contacts(count)')
    .order('nome')

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <AdminPageHeader title="Eventos" description="Gerenciar eventos e campanhas" />
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted">Erro ao carregar eventos.</p>
        </div>
      </div>
    )
  }

  const eventosComContagem = (eventos ?? []).map((e) => ({
    ...e,
    total_contacts: (e as unknown as { total_contacts: { count: number }[] }).total_contacts?.[0]?.count ?? 0,
  })) as (Evento & { total_contacts: number })[]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Eventos"
        description={`${eventosComContagem.length} evento(s) cadastrado(s)`}
      />
      <EventosClient eventos={eventosComContagem} />
    </div>
  )
}
