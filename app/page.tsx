import Link from 'next/link'
import Image from 'next/image'
import { QrCompartilhe } from '@/components/qr-compartilhe'
import { ArrowRight, Gift, Lock } from 'lucide-react'

export default function LandingPage() {
  const palestrasUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/palestras`
    : '/palestras'

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 mx-auto w-full max-w-5xl">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-diagnostic-vet.png"
            alt="Diagnostic Vet"
            width={140}
            height={39}
            className="h-9 w-auto"
            priority
          />
        </div>
        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Lock className="size-3" />
          Admin
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image
            src="/logo-abraveq.svg"
            alt="ABRAVEQ"
            width={200}
            height={68}
            className="h-20 w-auto"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          ABRAVEQ 2026
        </h1>
        <p className="mt-2 text-lg text-muted">
          XXVI Conferência Anual
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-muted">Patrocinador oficial</span>
          <Image
            src="/logo-diagnostic-vet.png"
            alt="Diagnostic Vet"
            width={100}
            height={28}
            className="h-7 w-auto opacity-80"
          />
        </div>

        <p className="mt-8 text-base text-muted max-w-md leading-relaxed">
          Reserve sua vaga nas palestras silenciosas e garanta seu lugar.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/palestras"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:brightness-110 transition-all"
          >
            Ver Programação
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/sorteio"
            className="inline-flex items-center gap-2 rounded-md border-2 border-primary/30 bg-card px-6 py-3 text-base font-medium text-foreground hover:border-primary/60 hover:bg-primary/5 transition-all"
          >
            <Gift className="size-5 text-primary" />
            Sorteio
          </Link>
        </div>

        <div className="mt-10">
          <QrCompartilhe url={palestrasUrl} />
        </div>
      </main>

      <footer className="mt-auto px-4 py-6 text-center text-xs text-muted">
        <p>ABRAVEQ — Associação Brasileira dos Médicos Veterinários de Equídeos</p>
      </footer>
    </div>
  )
}
