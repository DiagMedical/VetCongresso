import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/app/providers'
import { ChatFab } from '@/components/chat-fab'
import { SwRegister } from '@/components/sw-register'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0a1a',
  viewportFit: 'cover',
}

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DiagnosticCRM — Gestão de Relacionamento com Clientes',
  description: 'CRM completo para gestão de contatos, pipeline de vendas, atividades e comunicação. Diagnostic Vet.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  other: {
    'theme-color': '#0d0a1a',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
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
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo
        </a>
        <ThemeProvider>
          <main id="main-content" className="flex flex-1 flex-col">{children}</main>
          <ChatFab />
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
