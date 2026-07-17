import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function AdminPageHeader({ title, description, actions, className }: AdminPageHeaderProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm lg:p-6',
      className
    )}>
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent shadow-[0_0_8px_hsl(var(--primary)/0.3)]" aria-hidden="true" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/70">Admin</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          {description ? <p className="max-w-3xl text-sm leading-relaxed text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
