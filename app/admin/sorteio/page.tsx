import { listarSorteioLeads } from '@/lib/actions/sorteio'
import { SorteioAdmin } from './sorteio-admin'

export default async function AdminSorteioPage() {
  let leads
  try {
    leads = await listarSorteioLeads()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar leads do sorteio. Tente novamente.</p></div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sorteio Powerbank</h2>
      <SorteioAdmin leads={leads} />
    </div>
  )
}
