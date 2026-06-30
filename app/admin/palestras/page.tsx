import { listarPalestrasAdmin } from '@/lib/actions/palestras'
import { PalestrasClient } from './palestras-client'

export default async function PalestrasPage() {
  let palestras
  try {
    palestras = await listarPalestrasAdmin()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar palestras. Tente novamente.</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold text-foreground">Palestras</h2>
      </div>

      <PalestrasClient palestras={palestras} />
    </div>
  )
}
