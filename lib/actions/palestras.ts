'use server'

import { createClient } from '@/lib/supabase/server'
import type { PalestraFormData, Palestra } from '@/types'

export async function criarPalestra(data: PalestraFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('palestras').insert({
    dia_evento: data.dia_evento,
    tema: data.tema,
    palestrante: data.palestrante,
    descricao: data.descricao || null,
    horario_inicio: data.horario_inicio,
    horario_fim: data.horario_fim,
    vagas_totais: data.vagas_totais,
  })

  if (error) throw new Error(error.message)
}

export async function editarPalestra(id: string, data: PalestraFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('palestras')
    .update({
      dia_evento: data.dia_evento,
      tema: data.tema,
      palestrante: data.palestrante,
      descricao: data.descricao || null,
      horario_inicio: data.horario_inicio,
      horario_fim: data.horario_fim,
      vagas_totais: data.vagas_totais,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function desativarPalestra(id: string) {
  const supabase = await createClient()

  const { data: palestra } = await supabase
    .from('palestras')
    .select('ativo')
    .eq('id', id)
    .single()

  if (!palestra) throw new Error('Palestra não encontrada')

  const { error } = await supabase
    .from('palestras')
    .update({ ativo: !palestra.ativo })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function listarPalestrasAdmin(): Promise<Palestra[]> {
  const supabase = await createClient()

  const [{ data, error }, { data: vagas }] = await Promise.all([
    supabase
    .from('palestras')
    .select('*')
    .order('dia_evento')
    .order('horario_inicio')
    ,
    supabase
      .from('vagas_disponiveis')
      .select('id, vagas_restantes'),
  ])

  if (error) throw new Error(error.message)
  const vagasMap = new Map((vagas ?? []).map((v) => [v.id, v.vagas_restantes]))

  return (data ?? []).map((p) => ({
    ...p,
    vagas_restantes: vagasMap.get(p.id) ?? p.vagas_totais,
  })) as Palestra[]
}

export async function duplicarPalestra(id: string) {
  const supabase = await createClient()

  const { data: original } = await supabase
    .from('palestras')
    .select('*')
    .eq('id', id)
    .single()

  if (!original) throw new Error('Palestra não encontrada')

  const { error } = await supabase.from('palestras').insert({
    dia_evento: original.dia_evento,
    tema: original.tema + ' (cópia)',
    palestrante: original.palestrante,
    descricao: original.descricao,
    horario_inicio: original.horario_inicio,
    horario_fim: original.horario_fim,
    vagas_totais: original.vagas_totais,
  })

  if (error) throw new Error(error.message)
}

export async function excluirPalestra(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('palestras')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
