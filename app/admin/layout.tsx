import type { ReactNode } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { AdminNav } from '@/components/admin/nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminNav className="hidden lg:flex" />
        <div id="main-content" role="main" className="flex-1 overflow-auto bg-background p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
