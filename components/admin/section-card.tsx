import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminSectionCardProps {
  title?: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
}

export function AdminSectionCard({
  title,
  description,
  icon,
  children,
  className,
  headerClassName,
  bodyClassName,
}: AdminSectionCardProps) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card/80 shadow-[0_0_0_1px_hsl(var(--border))] backdrop-blur-sm hover:shadow-[0_0_0_1px_hsl(var(--border)),0_0_20px_hsl(var(--primary)/0.06)] transition-all duration-300', className)}>
      {(title || description || icon) && (
        <div className={cn('border-b border-border px-4 py-4 sm:px-5', headerClassName)}>
          <div className="flex items-start gap-3">
            {icon ? <div className="mt-0.5 text-muted">{icon}</div> : null}
            <div className="space-y-1">
              {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : null}
              {description ? <p className="text-xs leading-relaxed text-muted">{description}</p> : null}
            </div>
          </div>
        </div>
      )}
      <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  )
}
