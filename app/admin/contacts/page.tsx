import { createServiceClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/page-header'
import { ContactsClient } from './contacts-client'
import type { Contact, Evento } from '@/types'

export default async function ContactsPage() {
  let data: Contact[], total: number, eventos: Evento[]
  try {
    const supabase = createServiceClient()

    const [contactsRes, eventosRes] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(0, 999),
      supabase.from('eventos').select('*').order('nome'),
    ])

    if (contactsRes.error) throw contactsRes.error
    data = (contactsRes.data ?? []) as Contact[]
    total = contactsRes.count ?? 0
    eventos = (eventosRes.data ?? []) as Evento[]
  } catch {
    return (
      <div className="space-y-6 p-6">
        <p className="text-muted">Erro ao carregar contatos. Tente novamente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Leads"
        description={`${total} lead${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`}
      />
      <ContactsClient contacts={data} totalCount={total} eventos={eventos} />
    </div>
  )
}
