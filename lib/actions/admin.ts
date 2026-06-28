'use server'

import { createClient } from '@/lib/supabase/server'
import type { Inscrito } from '@/types'
import { adicionarParticipanteSchema } from '@/lib/schemas'
import { sendWhatsApp } from '@/lib/whatsapp/send'
import { sendEmail } from '@/lib/email/send'
import { listarPalestras } from '@/lib/actions/reserva'
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

export interface DashboardData {
  total_leads: number
  checkins_hoje: number
  palestras_ativas: number
  cancelamentos: number
  espera: number
  reservas_por_dia: { dia: number; reservas: number; checkins: number }[]
  reservas_por_palestra: {
    palestra_id: string
    tema: string
    palestrante: string
    vagas: number
    reservas: number
    checkins: number
    cancelados: number
    espera: number
    taxa_ocupacao: number
    taxa_checkin: number
  }[]
  ultimos_leads: {
    nome: string
    email: string
    palestra: string
    created_at: string
  }[]
  ranking_palestrantes: {
    palestrante: string
    reservas: number
    checkins: number
  }[]
}

export async function getDashboardData(diaFiltro?: number): Promise<DashboardData> {
  const supabase = await createClient()
  const hoje = new Date().toISOString().split('T')[0]

  let palestraIds: string[] | undefined

  if (diaFiltro) {
    const { data: palestrasDoDia } = await supabase
      .from('palestras')
      .select('id')
      .eq('ativo', true)
      .eq('dia_evento', diaFiltro)

    palestraIds = (palestrasDoDia ?? []).map((p) => p.id)
  }

  const inscritosBase = supabase.from('inscritos')

  async function executar<T>(query: ReturnType<typeof inscritosBase.select>) {
    if (palestraIds && palestraIds.length > 0) {
      const { data, count } = await (query as any).in('palestra_id', palestraIds) as { data: T | null; count: number | null }
      return { data, count }
    }
    const { data, count } = await query as { data: T | null; count: number | null }
    return { data, count }
  }

  const [{ count: total_leads }, { count: checkins_hoje }, { count: cancelamentos }, { count: espera }, { data: inscritos }] = await Promise.all([
    executar<never>(inscritosBase.select('*', { count: 'exact', head: true })),
    executar<never>(inscritosBase.select('*', { count: 'exact', head: true }).gte('checkin_at', hoje)),
    executar<never>(inscritosBase.select('*', { count: 'exact', head: true }).eq('status', 'cancelado_por_falta')),
    executar<never>(inscritosBase.select('*', { count: 'exact', head: true }).eq('status', 'espera')),
    executar<{ palestra_id: string; status: string; checkin_at: string | null; created_at: string }[]>(inscritosBase.select('palestra_id, status, checkin_at, created_at')),
  ])

  // Fetch palestras (with count)
  let palestrasQuery = supabase.from('palestras').select('*', { count: 'exact', head: true }).eq('ativo', true)
  let palestrasDataQuery = supabase.from('palestras').select('id, tema, palestrante, vagas_totais').eq('ativo', true)
  if (palestraIds && palestraIds.length > 0) {
    palestrasQuery = palestrasQuery.eq('dia_evento', diaFiltro)
    palestrasDataQuery = palestrasDataQuery.eq('dia_evento', diaFiltro)
  }
  const [{ count: palestras_ativas }, { data: palestras }] = await Promise.all([
    palestrasQuery,
    palestrasDataQuery,
  ])
  const palestrasData = palestras ?? []

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
    palestrasData.map((p) => [p.id, { tema: p.tema, palestrante: p.palestrante, vagas: p.vagas_totais }])
  )

  const reservaCount = new Map<string, { reservas: number; checkins: number; cancelados: number; espera: number }>()

  for (const i of inscritos ?? []) {
    const entry = reservaCount.get(i.palestra_id) ?? { reservas: 0, checkins: 0, cancelados: 0, espera: 0 }
    if (i.status === 'check-in') {
      entry.checkins++
      entry.reservas++
    } else if (i.status === 'confirmado') {
      entry.reservas++
    } else if (i.status === 'cancelado_por_falta') {
      entry.cancelados++
    } else if (i.status === 'espera') {
      entry.espera++
    }
    reservaCount.set(i.palestra_id, entry)
  }

  const reservas_por_palestra: DashboardData['reservas_por_palestra'] = []

  for (const [id, counts] of reservaCount) {
    const info = palestraMap.get(id)
    if (info) {
      reservas_por_palestra.push({
        palestra_id: id,
        tema: info.tema,
        palestrante: info.palestrante,
        vagas: info.vagas,
        ...counts,
        taxa_ocupacao: info.vagas > 0 ? Math.round((counts.reservas / info.vagas) * 100) : 0,
        taxa_checkin: counts.reservas > 0 ? Math.round((counts.checkins / counts.reservas) * 100) : 0,
      })
    }
  }

  const { data: ultimos } = await executar<{ nome: string; email: string; created_at: string; palestra: { tema: string } | { tema: string }[] | null }[]>(
    supabase.from('inscritos').select('nome, email, created_at, palestra:palestra_id(tema)')
  )
  const ultimosFiltrados = (ultimos ?? []).slice(0, 10).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const ultimos_leads: DashboardData['ultimos_leads'] = ultimosFiltrados.map((i) => {
    const palestra = Array.isArray(i.palestra) ? i.palestra[0] : i.palestra
    return {
      nome: i.nome,
      email: i.email,
      palestra: (palestra as { tema: string } | null)?.tema ?? '—',
      created_at: i.created_at,
    }
  })

  const rankingPalestrantesMap = new Map<string, { reservas: number; checkins: number }>()
  for (const p of reservas_por_palestra) {
    const entry = rankingPalestrantesMap.get(p.palestrante) ?? { reservas: 0, checkins: 0 }
    entry.reservas += p.reservas
    entry.checkins += p.checkins
    rankingPalestrantesMap.set(p.palestrante, entry)
  }
  const ranking_palestrantes = [...rankingPalestrantesMap.entries()]
    .map(([palestrante, counts]) => ({ palestrante, ...counts }))
    .sort((a, b) => b.reservas - a.reservas)

  return {
    total_leads: total_leads ?? 0,
    checkins_hoje: checkins_hoje ?? 0,
    palestras_ativas: palestras_ativas ?? 0,
    cancelamentos: cancelamentos ?? 0,
    espera: espera ?? 0,
    reservas_por_dia,
    reservas_por_palestra,
    ultimos_leads,
    ranking_palestrantes,
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
    const meiaHoraEmMs = 30 * 60 * 1000

    if (agora < inicio - meiaHoraEmMs) {
      throw new Error('Check-in liberado apenas 30 minutos antes do início')
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
  sendEmail(inscritoId, 'checkin').catch((err) =>
    console.error('[Email] erro ao enviar:', err)
  )
}

export async function realizarCheckInAdmin(inscritoId: string) {
  const supabase = await createClient()

  const { data: inscrito } = await supabase
    .from('inscritos')
    .select('id, status')
    .eq('id', inscritoId)
    .single()

  if (!inscrito) throw new Error('Inscrito não encontrado')
  if (inscrito.status !== 'confirmado') throw new Error('Check-in já realizado ou inscrição cancelada')

  const { error } = await supabase
    .from('inscritos')
    .update({ status: 'check-in', checkin_at: new Date().toISOString() })
    .eq('id', inscritoId)

  if (error) throw new Error(error.message)

  sendWhatsApp(inscritoId, 'checkin').catch((err) =>
    console.error('[WhatsApp] erro ao enviar:', err)
  )
  sendEmail(inscritoId, 'checkin').catch((err) =>
    console.error('[Email] erro ao enviar:', err)
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
  sendEmail(inscritoId, 'cancelamento').catch((err) =>
    console.error('[Email] erro ao enviar:', err)
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
    sendEmail(espera.id, 'promovido').catch((err) =>
      console.error('[Email] erro ao enviar:', err)
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
      aceite_lgpd: false,
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
  return listarPalestras()
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
  taxa_checkin: number
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
      taxa_checkin: stats.reservas > 0 ? Math.round((stats.checkins / stats.reservas) * 100) : 0,
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

export interface AnalyticsData {
  total_leads: number
  total_reservas: number
  total_checkins: number
  total_cancelados: number
  total_espera: number
  taxa_comparecimento: number
  ocupacao_media: number
  tempo_medio_ate_checkin_horas: number
  previsao_ocupacao_final: number
  evolucao_diaria: { data: string; reservas: number; checkins: number }[]
  ocupacao_por_dia: { dia: number; vagas: number; reservas: number; taxa: number }[]
  horarios_pico: { hora: string; reservas: number }[]
  por_palestra: RelatorioPalestra[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
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
    .order('created_at')

  const total_leads = inscritos?.length ?? 0
  const total_reservas = inscritos?.filter((i) => ['confirmado', 'check-in'].includes(i.status)).length ?? 0
  const total_checkins = inscritos?.filter((i) => i.status === 'check-in').length ?? 0
  const total_cancelados = inscritos?.filter((i) => i.status === 'cancelado_por_falta').length ?? 0
  const total_espera = inscritos?.filter((i) => i.status === 'espera').length ?? 0
  const taxa_comparecimento = total_reservas > 0 ? Math.round((total_checkins / total_reservas) * 100) : 0

  // Tempo médio created_at -> checkin_at
  let totalHoras = 0
  let countHoras = 0
  for (const i of inscritos ?? []) {
    if (i.checkin_at && i.created_at) {
      const diff = new Date(i.checkin_at).getTime() - new Date(i.created_at).getTime()
      totalHoras += diff / (1000 * 60 * 60)
      countHoras++
    }
  }
  const tempo_medio_ate_checkin_horas = countHoras > 0 ? Math.round((totalHoras / countHoras) * 10) / 10 : 0

  // Evolução diária (últimos 30 dias)
  const evolucaoMap = new Map<string, { reservas: number; checkins: number }>()
  const trintaDiasAtras = new Date()
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
  for (const i of inscritos ?? []) {
    const dataCriacao = new Date(i.created_at)
    if (dataCriacao < trintaDiasAtras) continue
    const chave = dataCriacao.toISOString().split('T')[0]
    const entry = evolucaoMap.get(chave) ?? { reservas: 0, checkins: 0 }
    if (['confirmado', 'check-in', 'espera'].includes(i.status)) entry.reservas++
    if (i.status === 'check-in') entry.checkins++
    evolucaoMap.set(chave, entry)
  }
  const evolucao_diaria: AnalyticsData['evolucao_diaria'] = []
  for (let d = 0; d < 30; d++) {
    const dt = new Date(trintaDiasAtras)
    dt.setDate(dt.getDate() + d)
    const chave = dt.toISOString().split('T')[0]
    const entry = evolucaoMap.get(chave) ?? { reservas: 0, checkins: 0 }
    if (entry.reservas > 0 || entry.checkins > 0) {
      evolucao_diaria.push({ data: dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), ...entry })
    }
  }

  // Ocupação por dia do evento
  const vagasPorDia = new Map<number, number>()
  const reservasPorDia = new Map<number, number>()
  for (const p of palestras ?? []) {
    vagasPorDia.set(p.dia_evento, (vagasPorDia.get(p.dia_evento) ?? 0) + p.vagas_totais)
  }
  for (const i of inscritos ?? []) {
    if (!['confirmado', 'check-in'].includes(i.status)) continue
    const palestraData = i.palestra as { dia_evento: number } | null
    if (!palestraData) continue
    reservasPorDia.set(palestraData.dia_evento, (reservasPorDia.get(palestraData.dia_evento) ?? 0) + 1)
  }
  const ocupacao_por_dia: AnalyticsData['ocupacao_por_dia'] = []
  for (let d = 1; d <= 3; d++) {
    const vagas = vagasPorDia.get(d) ?? 0
    const reservas = reservasPorDia.get(d) ?? 0
    ocupacao_por_dia.push({
      dia: d,
      vagas,
      reservas,
      taxa: vagas > 0 ? Math.round((reservas / vagas) * 100) : 0,
    })
  }

  // Horários de pico (por hora do dia)
  const horaMap = new Map<string, number>()
  for (const i of inscritos ?? []) {
    const h = new Date(i.created_at).getHours().toString().padStart(2, '0')
    horaMap.set(h, (horaMap.get(h) ?? 0) + 1)
  }
  const horarios_pico: AnalyticsData['horarios_pico'] = []
  for (let h = 0; h < 24; h++) {
    const chave = h.toString().padStart(2, '0')
    const total = horaMap.get(chave) ?? 0
    if (total > 0) {
      horarios_pico.push({ hora: `${chave}h`, reservas: total })
    }
  }

  // Previsão — ocupação final projetada com base no ritmo atual
  const diasDesdePrimeiraReserva = inscritos && inscritos.length > 0
    ? Math.max(1, Math.ceil((Date.now() - new Date(inscritos[0].created_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 1
  const totalVagas = (palestras ?? []).reduce((acc, p) => acc + p.vagas_totais, 0)
  const ritmoDiario = total_reservas / diasDesdePrimeiraReserva
  const totalPrevisto = Math.round(ritmoDiario * 4) // projeta para os 4 dias do evento
  const previsao_ocupacao_final = totalVagas > 0 ? Math.min(100, Math.round((totalPrevisto / totalVagas) * 100)) : 0

  // Per-lecture stats (reuse from getRelatorios logic)
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
      taxa_checkin: stats.reservas > 0 ? Math.round((stats.checkins / stats.reservas) * 100) : 0,
    })
  }

  const ocupacao_media = por_palestra.length > 0
    ? Math.round(por_palestra.reduce((acc, p) => acc + p.taxa_ocupacao, 0) / por_palestra.length)
    : 0

  return {
    total_leads,
    total_reservas,
    total_checkins,
    total_cancelados,
    total_espera,
    taxa_comparecimento,
    ocupacao_media,
    tempo_medio_ate_checkin_horas,
    previsao_ocupacao_final,
    evolucao_diaria,
    ocupacao_por_dia,
    horarios_pico,
    por_palestra,
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

export async function exportarLeads(): Promise<LeadExport[]> {
  const supabase = await createClient()

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

export async function limparPalestrasDuplicadas(confirmacao?: string) {
  if (!confirmacao || confirmacao !== 'CONFIRMAR') {
    return { removidas: 0, erro: 'Confirmação necessária. Passe confirmacao="CONFIRMAR".' }
  }

  const supabase = await createClient()

  const { data: palestras } = await supabase
    .from('palestras')
    .select('id, tema, ativo')
    .eq('ativo', true)

  if (!palestras) return { removidas: 0 }

  const temasVistos = new Map<string, string>()
  let removidas = 0
  for (const p of palestras) {
    const key = p.tema.toLowerCase().trim()
    if (temasVistos.has(key)) {
      await supabase.from('inscritos').delete().eq('palestra_id', p.id)
      await supabase.from('palestras').delete().eq('id', p.id)
      removidas++
    } else {
      temasVistos.set(key, p.id)
    }
  }

  return { removidas }
}

export type Admin = {
  id: string
  nome: string
  email: string
  created_at: string
}

export async function listarAdmins(): Promise<Admin[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at')
  if (error) throw new Error(error.message)
  return data as Admin[]
}

export async function adicionarAdmin(nome: string, email: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('admins')
    .insert({ nome, email })
  if (error) throw new Error(error.message)
}

export async function removerAdmin(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export interface CertificadoData {
  id: string
  nome: string
  email: string
  palestra_nome: string
  palestrante: string
  dia_evento: number
  horario_inicio: string
  horario_fim: string
  checkin_at: string
}

export async function listarCertificados(): Promise<CertificadoData[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(*)')
    .eq('status', 'check-in')
    .order('checkin_at', { ascending: false })

  if (error) throw new Error(error.message)

  return ((data ?? []) as Inscrito[]).map((i) => ({
    id: i.id,
    nome: i.nome,
    email: i.email,
    palestra_nome: i.palestra?.tema ?? '',
    palestrante: i.palestra?.palestrante ?? '',
    dia_evento: i.palestra?.dia_evento ?? 0,
    horario_inicio: i.palestra?.horario_inicio ?? '',
    horario_fim: i.palestra?.horario_fim ?? '',
    checkin_at: i.checkin_at ?? '',
  }))
}

export async function gerarResumoDashboard(data: DashboardData): Promise<string> {
  const palestrasTop = data.reservas_por_palestra
    .sort((a, b) => b.taxa_ocupacao - a.taxa_ocupacao)
    .slice(0, 3)

  const prompt = `Você é um assistente de dashboard do ABRAVEQ 2026. Gere UM resumo curto (2-3 frases) em português do Brasil com base nos seguintes números do evento:

- Total de leads: ${data.total_leads}
- Check-ins hoje: ${data.checkins_hoje}
- Palestras ativas: ${data.palestras_ativas}
- Cancelamentos: ${data.cancelamentos}
- Lista de espera: ${data.espera}
- Top 3 palestras por ocupação: ${palestrasTop.map((p) => `${p.tema} (${p.palestrante}) — ${p.taxa_ocupacao}% ocupação, ${p.checkins} check-ins`).join('; ')}

Regras:
- Seja breve, direto.
- Destaque o que está funcionando bem e o que precisa atenção.
- Use tom profissional mas amigável.
- Não invente números.
- Máximo 3 frases.`

  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      maxOutputTokens: 200,
    })
    return text
  } catch {
    return 'Resumo temporariamente indisponível.'
  }
}
