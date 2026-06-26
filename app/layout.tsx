import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/app/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ABRAVEQ 2026 — Silent Booking | Diagnostic Vet',
  description: 'Reserve sua vaga nas palestras silenciosas da XXVI Conferência Anual ABRAVEQ 2026. Patrocínio Diagnostic Vet.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        <ThemeProvider>
          <main id="main-content" className="flex flex-1 flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
