'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  TrendingUp,
  Shield,
  Award,
  Menu,
  X,
  PhoneCall,
  Kanban,
  ChartBar,
  CalendarRange,
} from 'lucide-react'
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet'
import { NotificationBadge } from '@/components/admin/notification-badge'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/contacts', label: 'Leads', icon: Users },
  { href: '/admin/eventos', label: 'Eventos', icon: CalendarRange },
  { href: '/admin/deals', label: 'Pipeline', icon: Kanban },
  { href: '/admin/activities', label: 'Atividades', icon: PhoneCall },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { href: '/admin/relatorios', label: 'Relatórios', icon: ChartBar },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
  { href: '/admin/certificados', label: 'Certificados', icon: Award },
  { href: '/admin/config', label: 'Configurações', icon: Settings },
]

function NavLinks() {
  const pathname = usePathname()

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          className={`flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
            pathname === href
              ? 'bg-primary text-primary-foreground shadow-[0_0_6px_hsl(var(--primary)/0.4)]'
              : 'text-muted hover:bg-white/5 hover:ring-1 hover:ring-foreground/5'
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
          {href === '/admin' && <NotificationBadge />}
        </Link>
      ))}
    </>
  )
}

export function AdminNav({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Navegação principal"
      className={`flex h-full min-h-0 w-56 flex-col gap-1 overflow-y-auto bg-card p-4 border-r border-border ${className ?? ''}`}
    >
      <NavLinks />
    </nav>
  )
}

function MobileNavLinks() {
  const pathname = usePathname()

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <SheetClose
          key={href}
          render={(closeProps: React.HTMLAttributes<HTMLElement>) => (
            <Link
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
                pathname === href
                  ? 'bg-primary text-primary-foreground shadow-[0_0_6px_hsl(var(--primary)/0.4)]'
                  : 'text-muted hover:bg-white/5 hover:ring-1 hover:ring-foreground/5'
              }`}
              {...closeProps}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          )}
        />
      ))}
    </>
  )
}

export function AdminMobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        className="flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 lg:hidden"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-r border-border bg-card p-0">
        <SheetClose className="absolute right-3 top-3 flex size-8 items-center justify-center text-muted transition-colors hover:text-foreground">
          <X className="size-4" />
          <span className="sr-only">Fechar</span>
        </SheetClose>
        <div className="flex max-h-full flex-col gap-1 overflow-y-auto p-4 pt-14">
          <MobileNavLinks />
        </div>
      </SheetContent>
    </Sheet>
  )
}
