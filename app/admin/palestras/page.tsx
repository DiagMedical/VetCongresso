import { listarPalestrasAdmin } from '@/lib/actions/palestras'
import { PalestrasClient } from './palestras-client'

export default async function PalestrasPage() {
  const palestras = await listarPalestrasAdmin()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Palestras</h2>
      </div>

      <PalestrasClient palestras={palestras} />
    </div>
  )
}
