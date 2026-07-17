import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function ImportLoading() {
  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader title="Importar Leads" description="Carregando..." />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}
