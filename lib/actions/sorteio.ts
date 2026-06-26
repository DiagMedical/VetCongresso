'use server'

import { createClient } from '@/lib/supabase/server'

export interface SorteioLead {
  id: string
  nome: string
  whatsapp: string
  email: string
  created_at: string
}

export async function inscreverSorteio(data: { nome: string; whatsapp: string; email: string }) {
  const supabase = await createClient()

  const { error } = await supabase.from('sorteio_leads').insert({
    nome: data.nome.trim(),
    whatsapp: data.whatsapp.trim(),
    email: data.email.trim().toLowerCase(),
  })

  if (error) {
    if (error.code === '23505') throw new Error('Este email já está cadastrado no sorteio')
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
