'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3, LayoutDashboard, QrCode, Users, BookOpen,
  MessageSquare, Settings, TrendingUp, Gift, Shield, Menu, X, UserCheck,
  Award,
} from 'lucide-react'
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/palestras', label: 'Palestras', icon: BookOpen },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/scanner', label: 'Scanner', icon: QrCode },
  { href: '/admin/scanner/manual', label: 'Check-in Manual', icon: UserCheck },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/sorteio', label: 'Sorteio', icon: Gift },
  { href: '/admin/certificados', label: 'Certificados', icon: Award },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
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
          className={`flex items-center gap-3 rounded-md min-h-[44px] px-3 py-2 text-sm transition-all duration-200 ${
            pathname === href
              ? 'bg-primary text-primary-foreground shadow-[0_0_6px_hsl(var(--primary)/0.4)]'
              : 'text-muted hover:bg-white/5 hover:ring-1 hover:ring-foreground/5'
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </>
  )
}

export function AdminNav({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Navegação principal"
      className={`flex-col gap-1 bg-card p-4 border-r border-border min-w-56 ${className ?? ''}`}
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
          render={
            <Link
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md min-h-[44px] px-3 py-2 text-sm transition-all duration-200 ${
                pathname === href
                  ? 'bg-primary text-primary-foreground shadow-[0_0_6px_hsl(var(--primary)/0.4)]'
                  : 'text-muted hover:bg-white/5 hover:ring-1 hover:ring-foreground/5'
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          }
        />
      ))}
    </>
  )
}

export function AdminMobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        className="flex items-center justify-center rounded-md size-9 text-muted hover:bg-white/5 transition-colors lg:hidden"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-card p-0 border-r border-border">
        <SheetClose className="absolute top-3 right-3 flex items-center justify-center size-8 text-muted hover:text-foreground transition-colors">
          <X className="size-4" />
          <span className="sr-only">Fechar</span>
        </SheetClose>
        <div className="flex flex-col gap-1 p-4 pt-14">
          <MobileNavLinks />
        </div>
      </SheetContent>
    </Sheet>
  )
}
