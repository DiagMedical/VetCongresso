import type { Palestra } from '@/types'

function fmtISO(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function fmtICSDatetime(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function buildGoogleCalendarUrl(p: Palestra) {
  const inicio = new Date(p.horario_inicio)
  const fim = new Date(p.horario_fim)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: p.tema,
    dates: `${fmtISO(inicio)}/${fmtISO(fim)}`,
    details: `Palestra: ${p.tema}\nPalestrante: ${p.palestrante}`,
    location: 'ABRAVEQ - Estande Diagnostic Vet',
  })

  return `https://calendar.google.com/calendar/render?${params}`
}

export function buildAppleCalendarUrl(p: Palestra) {
  const inicio = new Date(p.horario_inicio)
  const fim = new Date(p.horario_fim)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${fmtICSDatetime(inicio)}`,
    `DTEND:${fmtICSDatetime(fim)}`,
    `SUMMARY:${p.tema}`,
    `DESCRIPTION:Palestra: ${p.tema}\\nPalestrante: ${p.palestrante}`,
    `LOCATION:ABRAVEQ - Estande Diagnostic Vet`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
