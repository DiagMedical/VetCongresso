'use server'

import type { Palestra, Inscrito, ReservaFormData } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { reservaSchema } from '@/lib/schemas'
import { sendWhatsApp } from '@/lib/whatsapp/send'
import { sendEmail } from '@/lib/email/send'

export async function listarPalestras() {
  const supabase = await createClient()

  const { data: palestras, error } = await supabase
    .from('palestras')
    .select('*')
    .eq('ativo', true)
    .order('dia_evento')
    .order('horario_inicio')

  if (error) throw new Error(error.message)

  const { data: vagas } = await supabase
    .from('vagas_disponiveis')
    .select('*')

  const vagasMap = new Map(
    (vagas ?? []).map((v: { id: string; vagas_restantes: number }) => [v.id, v.vagas_restantes])
  )

  return (palestras ?? []).map((p) => ({
    ...p,
    vagas_restantes: vagasMap.get(p.id) ?? p.vagas_totais,
  })) as Palestra[]
}

export async function criarReserva(data: ReservaFormData) {
  const parsed = reservaSchema.safeParse(data)
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

  if (existente) throw new Error('Você já possui uma reserva ativa para esta palestra')

  const { count } = await supabase
    .from('vagas_disponiveis')
    .select('*', { count: 'exact', head: true })
    .eq('id', parsed.data.palestra_id)
    .gt('vagas_restantes', 0)

  const temVaga = (count ?? 0) > 0

  const { error } = await supabase.from('inscritos').insert({
    palestra_id: parsed.data.palestra_id,
    nome: parsed.data.nome,
    email: parsed.data.email,
    telefone: parsed.data.telefone,
    aceite_lgpd: parsed.data.aceite_lgpd,
    status: temVaga ? 'confirmado' : 'espera',
  })

  if (error) throw new Error(error.message)

  const { data: inscrito } = await supabase
    .from('inscritos')
    .select('id, status')
    .eq('email', parsed.data.email)
    .eq('palestra_id', parsed.data.palestra_id)
    .single()

  if (inscrito) {
    const tipo = inscrito.status === 'espera' ? 'espera' : 'confirmacao'
    sendWhatsApp(inscrito.id, tipo).catch((err) =>
      console.error('[WhatsApp] erro ao enviar:', err)
    )
    sendEmail(inscrito.id, tipo).catch((err) =>
      console.error('[Email] erro ao enviar:', err)
    )
  }

  return inscrito as { id: string; status: string }
}

export async function buscarInscrito(id: string) {
  const supabase = await createClient()

  const { data: inscrito, error } = await supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(*)')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return inscrito as Inscrito
}
