'use client'

import { BarChart3, LayoutDashboard, QrCode, Users, BookOpen, MessageSquare, Settings, TrendingUp, Gift } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/palestras', label: 'Palestras', icon: BookOpen },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/scanner', label: 'Scanner', icon: QrCode },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/sorteio', label: 'Sorteio', icon: Gift },
  { href: '/admin/config', label: 'Configurações', icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-1 bg-card p-4 border-r border-border min-w-56">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          className={`flex items-center gap-3 rounded-md min-h-[44px] px-3 py-2 text-sm transition-colors ${
            pathname === href
              ? 'bg-primary text-primary-foreground'
              : 'text-muted hover:bg-white/5'
          }`}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
