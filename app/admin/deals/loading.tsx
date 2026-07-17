import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function DealsLoading() {
  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader title="Pipeline" description="Carregando..." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-border bg-card/50 p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
