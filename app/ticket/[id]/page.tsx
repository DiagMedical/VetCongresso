import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buscarInscrito } from '@/lib/actions/reserva'
import { QrTicket } from '@/components/qr-ticket'
import { ArrowLeft } from 'lucide-react'
import type { Inscrito } from '@/types'

export default async function TicketPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  let inscrito: Inscrito
  try {
    inscrito = await buscarInscrito(id)
  } catch {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <Link
          href="/palestras"
          className="mb-6 flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">
          {inscrito.status === 'espera' ? 'Lista de Espera' : 'Reserva Confirmada'}
        </h1>

        <QrTicket inscrito={inscrito as Inscrito} />
      </div>
    </div>
  )
}
