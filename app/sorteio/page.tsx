import Link from 'next/link'
import Image from 'next/image'
import { QrCompartilhe } from '@/components/qr-compartilhe'
import { Gift } from 'lucide-react'

export default function SorteioPage() {
  const cadastroUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/sorteio/cadastro`
    : '/sorteio/cadastro'

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 mx-auto w-full max-w-5xl">
        <Image
          src="/logo-diagnostic-vet.png"
          alt="Diagnostic Vet"
          width={140}
          height={39}
          className="h-9 w-auto"
          priority
        />
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
          Sorteio Powerbank
        </h1>

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

        <p className="mt-4 text-base text-muted max-w-md leading-relaxed">
          Cadastre-se e concorra a um powerbank exclusivo!
        </p>

        <div className="mt-6">
          <QrCompartilhe url={cadastroUrl} />
        </div>

        <p className="mt-4 text-xs text-muted max-w-xs">
          Aponte a câmera para o QR Code ou acesse diretamente pelo link para se cadastrar.
        </p>

        <Link
          href={cadastroUrl}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:brightness-110 transition-all"
        >
          <Gift className="size-4" />
          Quero Participar
        </Link>
      </main>

      <footer className="mt-auto px-4 py-6 text-center text-xs text-muted">
        <p>ABRAVEQ — Associação Brasileira dos Médicos Veterinários de Equídeos</p>
      </footer>
    </div>
  )
}
