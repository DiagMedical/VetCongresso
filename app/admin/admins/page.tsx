import { listarAdmins } from '@/lib/actions/admin'
import { AdminsClient } from './admins-client'

export default async function AdminsPage() {
  const admins = await listarAdmins()
  return <AdminsClient admins={admins} />
}
