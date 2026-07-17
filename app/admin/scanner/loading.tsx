import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function ScannerLoading() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Scanner" description="Leia o QR Code para fazer check-in." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/80 p-5 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="aspect-square w-full max-w-sm mx-auto rounded-xl" />
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
