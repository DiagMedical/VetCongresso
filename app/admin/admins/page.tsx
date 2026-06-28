import { listarAdmins } from '@/lib/actions/admin'
import { AdminsClient } from './admins-client'

export default async function AdminsPage() {
  let admins
  try {
    admins = await listarAdmins()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar admins. Tente novamente.</p></div>
  }
  return <AdminsClient admins={admins} />
}
