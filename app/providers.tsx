'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Toaster } from 'sonner'
import type { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        aria-label="Notificações"
        toastOptions={{ duration: 6000 }}
        visibleToasts={3}
      />
    </NextThemesProvider>
  )
}
