import { listarSorteioLeads } from '@/lib/actions/sorteio'
import { SorteioAdmin } from './sorteio-admin'

export default async function AdminSorteioPage() {
  const leads = await listarSorteioLeads()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sorteio Powerbank</h2>
      <SorteioAdmin leads={leads} />
    </div>
  )
}
