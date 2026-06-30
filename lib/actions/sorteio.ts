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
