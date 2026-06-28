import { CalendarClock, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { Palestra } from '@/types'
import { formatTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buildGoogleCalendarUrl, buildAppleCalendarUrl } from '@/lib/calendar'

interface PalestraCardProps {
  palestra: Palestra
}

export function PalestraCard({ palestra }: PalestraCardProps) {
  const vagas = palestra.vagas_restantes ?? palestra.vagas_totais
  const lotado = vagas <= 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{palestra.tema}</h3>
          <Badge variant="secondary">Dia {palestra.dia_evento}</Badge>
        </div>

        <p className="text-sm text-muted-foreground">{palestra.palestrante}</p>

        {palestra.descricao && (
          <p className="text-sm text-muted-foreground/80 line-clamp-2">{palestra.descricao}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            {formatTime(palestra.horario_inicio)} - {formatTime(palestra.horario_fim)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" aria-hidden="true" />
            {lotado ? '0 vagas' : `${vagas} vaga${vagas !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/reserva/${palestra.id}`}
            className={`flex-1 rounded-md min-h-[44px] px-3 py-1.5 text-center text-sm font-medium transition-all flex items-center justify-center ${
              lotado
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'bg-primary text-primary-foreground hover:brightness-110'
            }`}
          >
            {lotado ? 'Lista de Espera' : 'Reservar'}
          </Link>
          <div className="flex gap-1">
            <a
              href={buildGoogleCalendarUrl(palestra)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-[44px] items-center justify-center rounded-md border border-border text-muted hover:bg-card hover:text-primary transition-colors"
              title="Adicionar ao Google Calendar"
            >
              <Calendar className="size-4" />
            </a>
            <a
              href={buildAppleCalendarUrl(palestra)}
              download="palestra.ics"
              className="flex size-[44px] items-center justify-center rounded-md border border-border text-muted hover:bg-card hover:text-primary transition-colors"
              title="Baixar arquivo .ics (Apple/Outlook)"
            >
              <Calendar className="size-4" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
