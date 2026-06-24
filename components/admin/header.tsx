'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

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
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3" role="banner">
      <h1 className="text-lg font-semibold text-foreground">VetCongresso</h1>
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
