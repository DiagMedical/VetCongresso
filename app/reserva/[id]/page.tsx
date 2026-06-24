import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ReservaForm } from '@/components/reserva-form'
import { formatTime } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export default async function ReservaPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: palestra } = await supabase
    .from('palestras')
    .select('*')
    .eq('id', id)
    .single()

  if (!palestra) notFound()

  const { data: vagas } = await supabase
    .from('vagas_disponiveis')
    .select('vagas_restantes')
    .eq('id', id)
    .single()

  const palestraComVagas = {
    ...palestra,
    vagas_restantes: vagas?.vagas_restantes ?? palestra.vagas_totais,
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <Link
          href="/"
          className="mb-6 flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold text-foreground">{palestra.tema}</h1>
          <p className="text-muted">{palestra.palestrante}</p>
          <p className="text-sm text-muted">
            Dia {palestra.dia_evento} | {formatTime(palestra.horario_inicio)} -{' '}
            {formatTime(palestra.horario_fim)}
          </p>
        </div>

        <ReservaForm palestra={palestraComVagas} />
      </div>
    </div>
  )
}
