import { createClient } from '@/lib/supabase/server'
import { getEmailConfig } from './config'
import {
  confirmacaoTemplate,
  esperaTemplate,
  checkinTemplate,
  promovidoTemplate,
  cancelamentoTemplate,
  lembreteTemplate,
} from './templates'
import { formatTime } from '@/lib/utils'

type TipoEmail = 'confirmacao' | 'espera' | 'checkin' | 'promovido' | 'lembrete' | 'cancelamento'

async function getConfig() {
  const supabase = await createClient()
  const { data } = await supabase.from('configuracoes').select('*')
  const map: Record<string, string> = {}
  for (const c of data ?? []) {
    map[c.chave] = c.valor
  }
  return getEmailConfig(map)
}

async function buildSubject(tipo: TipoEmail, tema: string): Promise<string> {
  const subjects: Record<TipoEmail, string> = {
    confirmacao: `✅ Reserva Confirmada — ${tema}`,
    espera: `⏳ Lista de Espera — ${tema}`,
    checkin: `🎟️ Check-in Realizado — ${tema}`,
    promovido: `🎉 Vaga Liberada — ${tema}`,
    lembrete: `⏰ Lembrete: ${tema} hoje`,
    cancelamento: `❌ Reserva Cancelada — ${tema}`,
  }
  return subjects[tipo]
}

export async function sendEmail(
  inscritoId: string,
  tipo: TipoEmail
) {
  const config = await getConfig()
  if (config.resend_enabled !== '1' || !config.resend_api_key) return

  const supabase = await createClient()

  const { data: inscrito } = await supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(*)')
    .eq('id', inscritoId)
    .single()

  if (!inscrito) throw new Error('Inscrito não encontrado')

  const palestra = Array.isArray(inscrito.palestra)
    ? inscrito.palestra[0]
    : inscrito.palestra
  if (!palestra) return

  const ticketUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/ticket/${inscrito.id}`

  const emailData = {
    nome: inscrito.nome,
    email: inscrito.email,
    telefone: inscrito.telefone,
    tema: palestra.tema,
    palestrante: palestra.palestrante,
    dia: palestra.dia_evento,
    inicio: formatTime(palestra.horario_inicio),
    fim: formatTime(palestra.horario_fim),
    status: inscrito.status,
    ticketUrl,
  }

  const templateMap: Record<TipoEmail, (d: typeof emailData) => string> = {
    confirmacao: confirmacaoTemplate,
    espera: esperaTemplate,
    checkin: checkinTemplate,
    promovido: promovidoTemplate,
    lembrete: lembreteTemplate,
    cancelamento: cancelamentoTemplate,
  }

  const html = templateMap[tipo](emailData)
  const subject = await buildSubject(tipo, palestra.tema)

  const { Resend } = await import('resend')
  const resend = new Resend(config.resend_api_key)

  const { error } = await resend.emails.send({
    from: `${config.resend_from_name} <${config.resend_from_email}>`,
    to: [inscrito.email],
    subject,
    html,
  })

  await supabase.from('mensagens_enviadas').insert({
    inscrito_id: inscritoId,
    telefone: `email: ${inscrito.email}`,
    tipo,
    mensagem: subject,
    sucesso: !error,
    erro: error?.message ?? null,
  })

  if (error) console.error('[Email] erro ao enviar:', error.message)
}
