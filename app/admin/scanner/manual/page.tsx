import { listarPalestrasAdmin } from '@/lib/actions/palestras'
import { listarInscritos } from '@/lib/actions/admin'
import { ManualClient } from './manual-client'

export default async function CheckinManualPage() {
  const [palestras, inscritos] = await Promise.all([
    listarPalestrasAdmin(),
    listarInscritos(),
  ])

  return (
    <ManualClient palestras={palestras} inscritos={inscritos} />
  )
}
