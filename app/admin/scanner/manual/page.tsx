import { listarPalestrasAdmin } from '@/lib/actions/palestras'
import { listarInscritos } from '@/lib/actions/admin'
import { ManualClient } from './manual-client'

export default async function CheckinManualPage() {
  let palestras, inscritos
  try {
    ;[palestras, inscritos] = await Promise.all([
      listarPalestrasAdmin(),
      listarInscritos(),
    ])
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar dados. Tente novamente.</p></div>
  }

  return (
    <ManualClient palestras={palestras} inscritos={inscritos} />
  )
}
