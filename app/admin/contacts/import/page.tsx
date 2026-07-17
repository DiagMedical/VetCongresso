import { AdminPageHeader } from '@/components/admin/page-header'
import { ImportClient } from './import-client'

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Importar Leads"
        description="Importe leads em lote via arquivo CSV."
      />
      <ImportClient />
    </div>
  )
}
