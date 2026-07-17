import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function ContactsLoading() {
  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader title="Leads" description="Carregando..." />
      <div className="space-y-3">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}
