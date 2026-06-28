import QRCode from 'qrcode'
import type { Inscrito } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import { Calendar, CalendarCheck } from 'lucide-react'
import { buildGoogleCalendarUrl, buildAppleCalendarUrl } from '@/lib/calendar'

interface QrTicketProps {
  inscrito: Inscrito
}

function buildQrPayload(i: Inscrito): string {
  const payload = {
    v: 1,
    id: i.id,
    n: i.nome,
    t: i.palestra?.tema ?? '',
    p: i.palestra?.palestrante ?? '',
    d: i.palestra?.horario_inicio ?? '',
    e: 'VetCongresso 2026',
  }
  return JSON.stringify(payload)
}

export async function QrTicket({ inscrito }: QrTicketProps) {
  if (!inscrito.palestra) return null

  const p = inscrito.palestra
  const isEspera = inscrito.status === 'espera'

  let qrDataUrl: string | null = null
  if (!isEspera) {
    qrDataUrl = await QRCode.toDataURL(buildQrPayload(inscrito), {
      width: 360,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border border-border bg-card p-6 text-center">
      {isEspera ? (
        <div className="flex size-40 items-center justify-center rounded-full bg-muted/30">
          <span className="text-4xl text-muted">⏳</span>
        </div>
      ) : qrDataUrl ? (
        <div className="rounded-lg border border-border bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR Code de check-in" className="size-[180px]" />
        </div>
      ) : null}

      <div>
        <h2 className="text-lg font-bold text-foreground">{p.tema}</h2>
        <p className="text-sm text-muted">{p.palestrante}</p>
      </div>

      <div className="text-sm text-muted space-y-1">
        <p>Dia {p.dia_evento}</p>
        <p>{formatTime(p.horario_inicio)} - {formatTime(p.horario_fim)}</p>
      </div>

      <div className="flex w-full gap-3">
        <a
          href={buildGoogleCalendarUrl(p)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-card transition-colors"
        >
          <Calendar className="size-4" />
          Google
        </a>
        <a
          href={buildAppleCalendarUrl(p)}
          download="palestra.ics"
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-card transition-colors"
        >
          <CalendarCheck className="size-4" />
          Apple
        </a>
      </div>

      <div className="w-full border-t border-border pt-4 text-xs text-muted">
        <p><strong>{inscrito.nome}</strong></p>
        <p>{inscrito.email}</p>
        <p className="mt-2">Reserva feita em {formatDate(inscrito.created_at)}</p>
        {isEspera ? (
          <p className="mt-1 font-semibold text-primary">
            Você está na lista de espera. Avisearemos se surgir uma vaga.
          </p>
        ) : (
          <p className="mt-1 font-semibold text-primary">Apresente este QR Code na entrada</p>
        )}
      </div>
    </div>
  )
}