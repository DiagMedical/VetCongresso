import { createServiceClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/page-header'
import { EventosClient } from './eventos-client'
import type { Evento } from '@/types'

export default async function EventosPage() {
  const supabase = createServiceClient()

  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*')
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

  // Contar quantos contacts têm cada evento (texto)
  const { data: contagens } = await supabase
    .from('contacts')
    .select('evento')

  const countMap = new Map<string, number>()
  if (contagens) {
    for (const c of contagens) {
      if (c.evento) {
        countMap.set(c.evento, (countMap.get(c.evento) ?? 0) + 1)
      }
    }
  }

  const eventosComContagem = (eventos ?? []).map((e) => ({
    ...e,
    total_contacts: countMap.get(e.nome) ?? 0,
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
