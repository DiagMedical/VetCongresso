import { listarSorteioLeads } from '@/lib/actions/sorteio'
import { SorteioAdmin } from './sorteio-admin'
import { AdminPageHeader } from '@/components/admin/page-header'

export default async function AdminSorteioPage() {
  let leads
  try {
    leads = await listarSorteioLeads()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar leads do sorteio. Tente novamente.</p></div>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sorteio Powerbank"
        description="Busca, exportação e sorteio manual dos cadastros do powerbank."
      />
      <SorteioAdmin leads={leads} />
    </div>
  )
}
