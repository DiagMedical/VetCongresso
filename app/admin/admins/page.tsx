import { listarAdmins } from '@/lib/actions/admin'
import { AdminsClient } from './admins-client'
import { AdminPageHeader } from '@/components/admin/page-header'

export default async function AdminsPage() {
  let admins
  try {
    admins = await listarAdmins()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar admins. Tente novamente.</p></div>
  }
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admins"
        description="Gerencie os acessos administrativos com nome, e-mail e remoção controlada."
      />
      <AdminsClient admins={admins} />
    </div>
  )
}
