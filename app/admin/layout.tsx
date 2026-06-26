import type { ReactNode } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { AdminNav } from '@/components/admin/nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminNav />
        <div id="main-content" role="main" className="flex-1 overflow-auto bg-background p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
