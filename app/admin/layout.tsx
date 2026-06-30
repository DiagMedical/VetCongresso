import type { ReactNode } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { AdminNav } from '@/components/admin/nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <AdminHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AdminNav className="hidden lg:flex flex-shrink-0" />
        <div role="main" className="min-w-0 flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
