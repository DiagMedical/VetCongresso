import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface KpiCardProps {
  title: string
  value: string | number
  icon: ReactNode
}

export function KpiCard({ title, value, icon }: KpiCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-4 p-(--card-spacing)">
        <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  )
}
