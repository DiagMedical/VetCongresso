import { listarPalestrasAdmin } from '@/lib/actions/palestras'
import { PalestrasClient } from './palestras-client'
import { AdminPageHeader } from '@/components/admin/page-header'

export default async function PalestrasPage() {
  let palestras
  try {
    palestras = await listarPalestrasAdmin()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar palestras. Tente novamente.</p></div>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Palestras"
        description="Cadastro, edição e organização da grade de palestras do congresso."
      />
      <PalestrasClient palestras={palestras} />
    </div>
  )
}
