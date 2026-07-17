import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function ScannerManualLoading() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Check-in Manual" description="Busque e faça check-in de participantes manualmente." />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
