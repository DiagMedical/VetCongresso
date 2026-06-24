'use server'

import { createClient } from '@/lib/supabase/server'
import type { Inscrito } from '@/types'
import { adicionarParticipanteSchema } from '@/lib/schemas'
import { sendWhatsApp } from '@/lib/whatsapp/send'

export interface DashboardData {
  total_leads: number
  checkins_hoje: number
  palestras_ativas: number
  cancelamentos: number
  espera: number
  reservas_por_dia: { dia: number; reservas: number; checkins: number }[]
  reservas_por_palestra: { palestra_id: string; tema: string; reservas: number; checkins: number; vagas: number }[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const hoje = new Date().toISOString().split('T')[0]

  const { count: total_leads } = await supabase
    .from('inscritos')
    .select('*', { count: 'exact', head: true })

  const { count: checkins_hoje } = await supabase
    .from('inscritos')
    .select('*', { count: 'exact', head: true })
    .gte('checkin_at', hoje)

  const { count: palestras_ativas } = await supabase
    .from('palestras')
    .select('*', { count: 'exact', head: true })
    .eq('ativo', true)

  const { count: cancelamentos } = await supabase
    .from('inscritos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelado_por_falta')

  const { count: espera } = await supabase
    .from('inscritos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'espera')

  const { data: palestras } = await supabase
    .from('palestras')
    .select('id, tema, vagas_totais')
    .eq('ativo', true)

  const { data: inscritos } = await supabase
    .from('inscritos')
    .select('palestra_id, status, checkin_at, created_at')

  const reservas_por_dia: DashboardData['reservas_por_dia'] = []
  const diaMap = new Map<number, { reservas: number; checkins: number }>()

  for (const i of inscritos ?? []) {
    const dia = new Date(i.created_at).getDate()
    const entry = diaMap.get(dia) ?? { reservas: 0, checkins: 0 }
    entry.reservas++
    if (i.status === 'check-in') entry.checkins++
    diaMap.set(dia, entry)
  }

  for (const [dia, vals] of diaMap) {
    reservas_por_dia.push({ dia, ...vals })
  }

  reservas_por_dia.sort((a, b) => a.dia - b.dia)

  const palestraMap = new Map(
    (palestras ?? []).map((p) => [p.id, { tema: p.tema, vagas: p.vagas_totais }])
  )

  const reservaCount = new Map<string, { reservas: number; checkins: number }>()

  for (const i of inscritos ?? []) {
    const entry = reservaCount.get(i.palestra_id) ?? { reservas: 0, checkins: 0 }
    entry.reservas++
    if (i.status === 'check-in') entry.checkins++
    reservaCount.set(i.palestra_id, entry)
  }

  const reservas_por_palestra: DashboardData['reservas_por_palestra'] = []

  for (const [id, counts] of reservaCount) {
    const info = palestraMap.get(id)
    if (info) {
      reservas_por_palestra.push({
        palestra_id: id,
        tema: info.tema,
        vagas: info.vagas,
        ...counts,
      })
    }
  }

  return {
    total_leads: total_leads ?? 0,
    checkins_hoje: checkins_hoje ?? 0,
    palestras_ativas: palestras_ativas ?? 0,
    cancelamentos: cancelamentos ?? 0,
    espera: espera ?? 0,
    reservas_por_dia,
    reservas_por_palestra,
  }
}

export async function realizarCheckIn(inscritoId: string) {
  const supabase = await createClient()

  const { data: inscrito } = await supabase
    .from('inscritos')
    .select('id, status, palestra:palestra_id(horario_inicio)')
    .eq('id', inscritoId)
    .single()

  if (!inscrito) throw new Error('Inscrito não encontrado')
  if (inscrito.status !== 'confirmado') throw new Error('QR Code já utilizado')

  const palestraData = inscrito.palestra as { horario_inicio: string } | { horario_inicio: string }[] | null
  const palestra = Array.isArray(palestraData) ? palestraData[0] : palestraData
  if (palestra) {
    const inicio = new Date(palestra.horario_inicio).getTime()
    const agora = Date.now()
    const dezMinEmMs = 10 * 60 * 1000

    if (agora < inicio - dezMinEmMs) {
      throw new Error('Check-in liberado apenas 10 minutos antes do início')
    }

    if (agora > inicio) {
      throw new Error('Palestra já iniciou. Check-in não permitido.')
    }
  }

  const { error } = await supabase
    .from('inscritos')
    .update({ status: 'check-in', checkin_at: new Date().toISOString() })
    .eq('id', inscritoId)

  if (error) throw new Error(error.message)

  sendWhatsApp(inscritoId, 'checkin').catch((err) =>
    console.error('[WhatsApp] erro ao enviar:', err)
  )
}

export async function cancelarPorFalta(inscritoId: string) {
  const supabase = await createClient()

  const { data: atual } = await supabase
    .from('inscritos')
    .select('palestra_id')
    .eq('id', inscritoId)
    .single()

  if (!atual) throw new Error('Inscrito não encontrado')

  const { error } = await supabase
    .from('inscritos')
    .update({ status: 'cancelado_por_falta', cancelado_at: new Date().toISOString() })
    .eq('id', inscritoId)

  if (error) throw new Error(error.message)

  sendWhatsApp(inscritoId, 'cancelamento').catch((err) =>
    console.error('[WhatsApp] erro ao enviar:', err)
  )

  // Promote next person on waiting list
  const { data: espera } = await supabase
    .from('inscritos')
    .select('id')
    .eq('palestra_id', atual.palestra_id)
    .eq('status', 'espera')
    .order('created_at')
    .limit(1)
    .single()

  if (espera) {
    await supabase
      .from('inscritos')
      .update({ status: 'confirmado' })
      .eq('id', espera.id)

    sendWhatsApp(espera.id, 'promovido').catch((err) =>
      console.error('[WhatsApp] erro ao enviar:', err)
    )
  }
}

export async function adicionarParticipante(data: {
  palestra_id: string
  nome: string
  email: string
  telefone: string
}) {
  const parsed = adicionarParticipanteSchema.safeParse(data)
  if (!parsed.success) {
    const msgs = parsed.error.issues.map((i) => i.message).join('; ')
    throw new Error(msgs)
  }

  const supabase = await createClient()

  const { data: existente } = await supabase
    .from('inscritos')
    .select('id')
    .eq('email', parsed.data.email)
    .eq('palestra_id', parsed.data.palestra_id)
    .in('status', ['confirmado', 'check-in', 'espera'])
    .maybeSingle()

  if (existente) throw new Error('Este email já possui uma reserva ativa para esta palestra')

  const { data: inscrito, error } = await supabase
    .from('inscritos')
    .insert({
      palestra_id: parsed.data.palestra_id,
      nome: parsed.data.nome,
      email: parsed.data.email,
      telefone: parsed.data.telefone,
      origem: 'manual',
    })
    .select('id')
    .single()

  if (error) {
    if (error.message === 'Palestra lotada') throw new Error('Palestra lotada')
    throw new Error(error.message)
  }

  return inscrito
}

export async function listarInscritos(palestraId?: string): Promise<Inscrito[]> {
  const supabase = await createClient()

  let query = supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(*)')
    .order('created_at', { ascending: false })

  if (palestraId) query = query.eq('palestra_id', palestraId)

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data as Inscrito[]
}

export async function listarPalestrasComVagas() {
  const supabase = await createClient()

  const { data: palestras } = await supabase
    .from('palestras')
    .select('*')
    .eq('ativo', true)
    .order('dia_evento')
    .order('horario_inicio')

  const { data: vagas } = await supabase.from('vagas_disponiveis').select('*')

  const vagasMap = new Map(
    (vagas ?? []).map((v) => [v.id, v.vagas_restantes])
  )

  return (palestras ?? []).map((p) => ({
    ...p,
    vagas_restantes: vagasMap.get(p.id) ?? p.vagas_totais,
  }))
}

export interface LeadExport {
  nome: string
  email: string
  telefone: string
  palestra: string
  status: string
  data: string
}

export interface RelatorioPalestra {
  palestra_id: string
  tema: string
  palestrante: string
  dia: number
  vagas: number
  reservas: number
  checkins: number
  cancelados: number
  espera: number
  taxa_ocupacao: number
}

export interface RelatorioDia {
  dia: number
  reservas: number
  checkins: number
  cancelados: number
  espera: number
}

export interface RelatoriosData {
  total_leads: number
  total_reservas: number
  total_checkins: number
  total_cancelados: number
  total_espera: number
  taxa_comparecimento: number
  ocupacao_media: number
  por_palestra: RelatorioPalestra[]
  por_dia: RelatorioDia[]
}

export async function getRelatorios(): Promise<RelatoriosData> {
  const supabase = await createClient()

  const { data: palestras } = await supabase
    .from('palestras')
    .select('*')
    .eq('ativo', true)
    .order('dia_evento')
    .order('horario_inicio')

  const { data: inscritos } = await supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(tema, palestrante, vagas_totais, dia_evento)')

  const total_leads = inscritos?.length ?? 0
  const total_reservas = inscritos?.filter((i) => ['confirmado', 'check-in'].includes(i.status)).length ?? 0
  const total_checkins = inscritos?.filter((i) => i.status === 'check-in').length ?? 0
  const total_cancelados = inscritos?.filter((i) => i.status === 'cancelado_por_falta').length ?? 0
  const total_espera = inscritos?.filter((i) => i.status === 'espera').length ?? 0
  const taxa_comparecimento = total_reservas > 0 ? Math.round((total_checkins / total_reservas) * 100) : 0

  // Per-lecture stats
  const palestraStats = new Map<string, { reservas: number; checkins: number; cancelados: number; espera: number }>()
  for (const i of inscritos ?? []) {
    const s = palestraStats.get(i.palestra_id) ?? { reservas: 0, checkins: 0, cancelados: 0, espera: 0 }
    if (['confirmado', 'check-in'].includes(i.status)) s.reservas++
    if (i.status === 'check-in') s.checkins++
    if (i.status === 'cancelado_por_falta') s.cancelados++
    if (i.status === 'espera') s.espera++
    palestraStats.set(i.palestra_id, s)
  }

  const por_palestra: RelatorioPalestra[] = []
  for (const p of palestras ?? []) {
    const stats = palestraStats.get(p.id) ?? { reservas: 0, checkins: 0, cancelados: 0, espera: 0 }
    por_palestra.push({
      palestra_id: p.id,
      tema: p.tema,
      palestrante: p.palestrante,
      dia: p.dia_evento,
      vagas: p.vagas_totais,
      reservas: stats.reservas,
      checkins: stats.checkins,
      cancelados: stats.cancelados,
      espera: stats.espera,
      taxa_ocupacao: p.vagas_totais > 0 ? Math.round((stats.reservas / p.vagas_totais) * 100) : 0,
    })
  }

  const ocupacao_media = por_palestra.length > 0
    ? Math.round(por_palestra.reduce((acc, p) => acc + p.taxa_ocupacao, 0) / por_palestra.length)
    : 0

  // Per-day stats
  const diaMap = new Map<number, { reservas: number; checkins: number; cancelados: number; espera: number }>()
  for (const p of por_palestra) {
    const d = diaMap.get(p.dia) ?? { reservas: 0, checkins: 0, cancelados: 0, espera: 0 }
    d.reservas += p.reservas
    d.checkins += p.checkins
    d.cancelados += p.cancelados
    d.espera += p.espera
    diaMap.set(p.dia, d)
  }

  const por_dia: RelatorioDia[] = []
  for (let d = 1; d <= 3; d++) {
    const stats = diaMap.get(d) ?? { reservas: 0, checkins: 0, cancelados: 0, espera: 0 }
    por_dia.push({ dia: d, ...stats })
  }

  return {
    total_leads,
    total_reservas,
    total_checkins,
    total_cancelados,
    total_espera,
    taxa_comparecimento,
    ocupacao_media,
    por_palestra,
    por_dia,
  }
}

export async function getConfiguracoes() {
  const supabase = await createClient()
  const { data } = await supabase.from('configuracoes').select('*')
  const map: Record<string, string> = {}
  for (const c of data ?? []) map[c.chave] = c.valor
  return map
}

export async function salvarConfiguracao(chave: string, valor: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('configuracoes').upsert(
    { chave, valor, updated_at: new Date().toISOString() },
    { onConflict: 'chave' }
  )
  if (error) throw new Error(error.message)
}

export interface MensagemEnviada {
  id: string
  inscrito_id: string | null
  telefone: string
  tipo: string
  mensagem: string
  sucesso: boolean
  zaap_id: string | null
  erro: string | null
  created_at: string
}

export async function listarMensagens() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mensagens_enviadas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return data as MensagemEnviada[]
}

export async function testarWhatsApp(inscritoId: string) {
  const { sendWhatsApp } = await import('@/lib/whatsapp/send')
  return sendWhatsApp(inscritoId, 'confirmacao')
}

export async function exportarLeads(_formato: 'xlsx' | 'csv'): Promise<LeadExport[]> {
  const supabase = await createClient()
  void _formato

  const { data } = await supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(tema)')
    .order('created_at', { ascending: false })

  return (data ?? []).map((i: Record<string, unknown>) => {
    const palestra = i.palestra as { tema: string } | null
    return {
      nome: String(i.nome ?? ''),
      email: String(i.email ?? ''),
      telefone: String(i.telefone ?? ''),
      palestra: palestra?.tema ?? '—',
      status: String(i.status ?? ''),
      data: new Date(String(i.created_at)).toLocaleString('pt-BR'),
    }
  })
}
