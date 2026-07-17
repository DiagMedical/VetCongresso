import { createServiceClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/page-header'
import { ContactsClient } from './contacts-client'
import type { Contact } from '@/types'

export default async function ContactsPage() {
  let data: Contact[], total: number
  try {
    const supabase = createServiceClient()
    const { data: contacts, count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 999)

    if (error) throw error
    data = (contacts ?? []) as Contact[]
    total = count ?? 0
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
        title="Contatos"
        description={`${total} contato${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`}
      />
      <ContactsClient contacts={data} totalCount={total} />
    </div>
  )
}
