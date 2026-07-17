import { AdminPageHeader } from '@/components/admin/page-header'
import { AdminSectionCard } from '@/components/admin/section-card'

export default function EventosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <AdminPageHeader title="Eventos" description="Carregando..." />
      <AdminSectionCard>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 rounded-lg bg-border" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4">
                <div className="h-5 w-40 rounded bg-border" />
                <div className="h-5 w-20 rounded bg-border" />
                <div className="h-5 w-16 rounded bg-border" />
                <div className="ml-auto h-8 w-16 rounded bg-border" />
              </div>
            ))}
          </div>
        </div>
      </AdminSectionCard>
    </div>
  )
}
