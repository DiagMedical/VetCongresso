'use server'

import { createClient } from '@/lib/supabase/server'
import { sorteioSchema } from '@/lib/schemas'
import { checkRateLimit } from '@/lib/rate-limit'

export interface SorteioLead {
  id: string
  nome: string
  whatsapp: string
  email: string
  created_at: string
}

export async function inscreverSorteio(data: { nome: string; whatsapp: string; email: string }) {
  const parsed = sorteioSchema.safeParse(data)
  if (!parsed.success) {
    const msgs = parsed.error.issues.map((i) => i.message).join('; ')
    throw new Error(msgs)
  }

  const ip = 'sorteio'
  const { allowed, retryAfter } = checkRateLimit(ip)
  if (!allowed) throw new Error(`Muitas tentativas. Tente novamente em ${retryAfter} segundos.`)

  const supabase = await createClient()

  const nome = parsed.data.nome.trim()
  const whatsapp = parsed.data.whatsapp.trim()
  const email = parsed.data.email.trim().toLowerCase()

  const { error: errLead } = await supabase.from('sorteio_leads').insert({
    nome,
    whatsapp,
    email,
  })

  if (errLead) {
    if (errLead.code === '23505') throw new Error('Este email já está cadastrado no sorteio')
    throw new Error('Erro ao cadastrar. Tente novamente.')
  }
}

export async function listarSorteioLeads(): Promise<SorteioLead[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sorteio_leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as SorteioLead[]
}

export async function removerSorteioLead(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sorteio_leads')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function exportarSorteioLeads(): Promise<{ nome: string; whatsapp: string; email: string; data: string }[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('sorteio_leads')
    .select('*')
    .order('created_at', { ascending: false })

  return (data ?? []).map((i) => ({
    nome: i.nome,
    whatsapp: i.whatsapp,
    email: i.email,
    data: new Date(i.created_at).toLocaleString('pt-BR'),
  }))
}

export async function migrarLeadsParaSorteio(): Promise<{ migrados: number; ignorados: number; total_inscritos: number }> {
  const supabase = await createClient()

  // 1. Buscar todos os inscritos ativos
  const { data: inscritos, error: errInscritos } = await supabase
    .from('inscritos')
    .select('nome, email, telefone, created_at')
    .eq('status', 'confirmado')

  if (errInscritos) throw new Error('Erro ao buscar inscritos: ' + errInscritos.message)

  const { data: checkins, error: errCheckins } = await supabase
    .from('inscritos')
    .select('nome, email, telefone, created_at')
    .eq('status', 'check-in')

  if (errCheckins) throw new Error('Erro ao buscar check-ins: ' + errCheckins.message)

  // Combinar confirmados + check-ins, deduplicar por email (mantém o primeiro)
  const todos = [...(inscritos ?? []), ...(checkins ?? [])]
  const vistos = new Set<string>()
  const unicos: { nome: string; email: string; telefone: string; created_at: string }[] = []

  for (const i of todos) {
    const email = i.email.toLowerCase()
    if (!vistos.has(email)) {
      vistos.add(email)
      unicos.push({
        nome: i.nome,
        email,
        telefone: i.telefone ?? '',
        created_at: i.created_at,
      })
    }
  }

  // 2. Buscar emails já existentes no sorteio
  const { data: existing, error: errExisting } = await supabase
    .from('sorteio_leads')
    .select('email')

  if (errExisting) throw new Error('Erro ao buscar sorteio: ' + errExisting.message)

  const existingEmails = new Set((existing ?? []).map((e: { email: string }) => e.email.toLowerCase()))

  // 3. Filtrar só quem NÃO está no sorteio
  const paraInserir = unicos.filter((i) => !existingEmails.has(i.email))

  // 4. Insert batch (ON CONFLICT DO NOTHING como dupla proteção)
  let migrados = 0

  if (paraInserir.length > 0) {
    const rows = paraInserir.map((i) => ({
      nome: i.nome,
      whatsapp: i.telefone,
      email: i.email,
      created_at: i.created_at,
    }))

    const { error: errInsert } = await supabase
      .from('sorteio_leads')
      .insert(rows)

    if (errInsert) {
      // Se der erro de UNIQUE, tenta um a um (pode ser que um email entrou entre a checagem e o insert)
      if (errInsert.code === '23505') {
        for (const i of paraInserir) {
          const { error: errSingle } = await supabase
            .from('sorteio_leads')
            .insert({
              nome: i.nome,
              whatsapp: i.telefone,
              email: i.email,
              created_at: i.created_at,
            })
          if (!errSingle) migrados++
        }
      } else {
        throw new Error('Erro ao migrar leads: ' + errInsert.message)
      }
    } else {
      migrados = paraInserir.length
    }
  }

  return {
    migrados,
    ignorados: unicos.length - migrados,
    total_inscritos: unicos.length,
  }
}
