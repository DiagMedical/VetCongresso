import { CalendarClock, Users } from 'lucide-react'
import Link from 'next/link'
import type { Palestra } from '@/types'
import { formatTime } from '@/lib/utils'

interface PalestraCardProps {
  palestra: Palestra
}

export function PalestraCard({ palestra }: PalestraCardProps) {
  const vagas = palestra.vagas_restantes ?? palestra.vagas_totais
  const lotado = vagas <= 0

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground">{palestra.tema}</h3>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Dia {palestra.dia_evento}
        </span>
      </div>

      <p className="text-sm text-muted">{palestra.palestrante}</p>

      {palestra.descricao && (
        <p className="text-sm text-muted/80 line-clamp-2">{palestra.descricao}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          {formatTime(palestra.horario_inicio)} - {formatTime(palestra.horario_fim)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="size-3.5" aria-hidden="true" />
          {lotado ? '0 vagas' : `${vagas} vaga${vagas !== 1 ? 's' : ''}`}
        </span>
      </div>

      <Link
        href={`/reserva/${palestra.id}`}
        className={`mt-1 rounded-md min-h-[44px] px-3 py-1.5 text-center text-sm font-medium transition-all flex items-center justify-center ${
          lotado
            ? 'bg-muted/30 text-muted hover:bg-muted/50'
            : 'bg-primary text-primary-foreground hover:brightness-110'
        }`}
      >
        {lotado ? 'Lista de Espera' : 'Reservar'}
      </Link>
    </article>
  )
}
