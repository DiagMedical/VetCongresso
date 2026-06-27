'use client'

import { LogOut, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { AdminMobileNav } from '@/components/admin/nav'

export function AdminHeader() {
  const router = useRouter()

  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6" role="banner">
      <div className="flex items-center gap-2">
        <AdminMobileNav />
        <Link href="/" className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted hover:text-foreground transition-colors">
          <ExternalLink className="size-4" />
          Site
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-md min-h-[44px] px-3 py-1.5 text-sm text-muted hover:bg-white/10 transition-colors"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </button>
      </div>
    </header>
  )
}
