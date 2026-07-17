'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { Contact, Deal, PipelineStage, Activity, CrmDashboardData } from '@/types'
import { contactSchema, dealSchema, pipelineStageSchema, activitySchema } from '@/lib/schemas'
import type { ContactFormData, DealFormData, PipelineStageFormData, ActivityFormData } from '@/lib/schemas'

// ============================================================
// Contacts CRUD
// ============================================================

export async function listarContacts(params?: {
  search?: string
  vendedor?: string
  origem?: string
  page?: number
  pageSize?: number
}): Promise<{ data: Contact[]; total: number }> {
  const supabase = createServiceClient()
  const page = params?.page ?? 0
  const pageSize = Math.min(params?.pageSize ?? 50, 1000)

  let query = supabase.from('contacts').select('*', { count: 'exact' })

  if (params?.search) {
    const search = `%${params.search}%`
    query = query.or(`nome.ilike.${search},email.ilike.${search},telefone.ilike.${search}`)
  }

  if (params?.vendedor) {
    query = query.eq('vendedor', params.vendedor)
  }

  if (params?.origem) {
    query = query.eq('origem', params.origem)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) throw new Error('Erro ao listar contatos: ' + error.message)
  return { data: (data ?? []) as Contact[], total: count ?? 0 }
}

export async function getContact(id: string): Promise<Contact | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single()
  if (error) throw new Error('Erro ao buscar contato: ' + error.message)
  return data as Contact | null
}

export async function createContact(formData: ContactFormData): Promise<Contact> {
  const parsed = contactSchema.parse(formData)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      nome: parsed.nome,
      email: parsed.email || null,
      telefone: parsed.telefone || null,
      origem: parsed.origem || 'manual',
      vendedor: parsed.vendedor || null,
      observacoes: parsed.observacoes || null,
      tags: parsed.tags,
    })
    .select()
    .single()

  if (error) throw new Error('Erro ao criar contato: ' + error.message)
  return data as Contact
}

export async function updateContact(id: string, formData: Partial<ContactFormData>): Promise<Contact> {
  const parsed = contactSchema.partial().parse(formData)
  const supabase = createServiceClient()

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.nome !== undefined) updateData.nome = parsed.nome
  if (parsed.email !== undefined) updateData.email = parsed.email || null
  if (parsed.telefone !== undefined) updateData.telefone = parsed.telefone || null
  if (parsed.origem !== undefined) updateData.origem = parsed.origem
  if (parsed.vendedor !== undefined) updateData.vendedor = parsed.vendedor || null
  if (parsed.observacoes !== undefined) updateData.observacoes = parsed.observacoes || null
  if (parsed.tags !== undefined) updateData.tags = parsed.tags

  const { data, error } = await supabase
    .from('contacts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Erro ao atualizar contato: ' + error.message)
  return data as Contact
}

export async function deleteContact(id: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) throw new Error('Erro ao excluir contato: ' + error.message)
}

// ============================================================
// Pipeline Stages CRUD
// ============================================================

export async function listarPipelineStages(): Promise<PipelineStage[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('ordem', { ascending: true })

  if (error) throw new Error('Erro ao listar estágios: ' + error.message)
  return (data ?? []) as PipelineStage[]
}

export async function createPipelineStage(formData: PipelineStageFormData): Promise<PipelineStage> {
  const parsed = pipelineStageSchema.parse(formData)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pipeline_stages')
    .insert(parsed)
    .select()
    .single()

  if (error) throw new Error('Erro ao criar estágio: ' + error.message)
  return data as PipelineStage
}

export async function updatePipelineStage(id: string, formData: Partial<PipelineStageFormData>): Promise<PipelineStage> {
  const parsed = pipelineStageSchema.partial().parse(formData)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pipeline_stages')
    .update(parsed)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Erro ao atualizar estágio: ' + error.message)
  return data as PipelineStage
}

export async function reorderStages(stages: { id: string; ordem: number }[]): Promise<void> {
  const supabase = createServiceClient()

  for (const stage of stages) {
    const { error } = await supabase
      .from('pipeline_stages')
      .update({ ordem: stage.ordem })
      .eq('id', stage.id)

    if (error) throw new Error('Erro ao reordenar estágios: ' + error.message)
  }
}

// ============================================================
// Deals CRUD
// ============================================================

export async function listarDeals(params?: {
  stage_id?: string
  vendedor?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<{ data: Deal[]; total: number }> {
  const supabase = createServiceClient()
  const page = params?.page ?? 0
  const pageSize = Math.min(params?.pageSize ?? 50, 1000)

  let query = supabase
    .from('deals')
    .select('*, contact:contacts(*), stage:pipeline_stages(*)', { count: 'exact' })

  if (params?.stage_id) {
    query = query.eq('stage_id', params.stage_id)
  }

  if (params?.vendedor) {
    query = query.eq('vendedor', params.vendedor)
  }

  if (params?.search) {
    const search = `%${params.search}%`
    query = query.or(`titulo.ilike.${search},descricao.ilike.${search}`)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) throw new Error('Erro ao listar deals: ' + error.message)
  return { data: (data ?? []) as Deal[], total: count ?? 0 }
}

export async function getDeal(id: string): Promise<Deal | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('deals')
    .select('*, contact:contacts(*), stage:pipeline_stages(*)')
    .eq('id', id)
    .single()

  if (error) throw new Error('Erro ao buscar deal: ' + error.message)
  return data as Deal | null
}

export async function createDeal(formData: DealFormData): Promise<Deal> {
  const parsed = dealSchema.parse(formData)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('deals')
    .insert({
      titulo: parsed.titulo,
      contact_id: parsed.contact_id,
      valor: parsed.valor,
      stage_id: parsed.stage_id,
      vendedor: parsed.vendedor || null,
      descricao: parsed.descricao || null,
      data_fechamento: parsed.data_fechamento || null,
      motivo_perda: parsed.motivo_perda || null,
    })
    .select('*, contact:contacts(*), stage:pipeline_stages(*)')
    .single()

  if (error) throw new Error('Erro ao criar deal: ' + error.message)
  return data as Deal
}

export async function updateDeal(id: string, formData: Partial<DealFormData>): Promise<Deal> {
  const parsed = dealSchema.partial().parse(formData)
  const supabase = createServiceClient()

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.titulo !== undefined) updateData.titulo = parsed.titulo
  if (parsed.contact_id !== undefined) updateData.contact_id = parsed.contact_id
  if (parsed.valor !== undefined) updateData.valor = parsed.valor
  if (parsed.stage_id !== undefined) updateData.stage_id = parsed.stage_id
  if (parsed.vendedor !== undefined) updateData.vendedor = parsed.vendedor || null
  if (parsed.descricao !== undefined) updateData.descricao = parsed.descricao || null
  if (parsed.data_fechamento !== undefined) updateData.data_fechamento = parsed.data_fechamento || null
  if (parsed.motivo_perda !== undefined) updateData.motivo_perda = parsed.motivo_perda || null

  const { data, error } = await supabase
    .from('deals')
    .update(updateData)
    .eq('id', id)
    .select('*, contact:contacts(*), stage:pipeline_stages(*)')
    .single()

  if (error) throw new Error('Erro ao atualizar deal: ' + error.message)
  return data as Deal
}

export async function moveDealStage(id: string, stageId: string): Promise<Deal> {
  const supabase = createServiceClient()

  // Se moveu para "Fechado", registra data_fechamento
  const stage = await supabase.from('pipeline_stages').select('nome').eq('id', stageId).single()
  const isClosed = stage.data?.nome === 'Fechado'

  const { data, error } = await supabase
    .from('deals')
    .update({
      stage_id: stageId,
      data_fechamento: isClosed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, contact:contacts(*), stage:pipeline_stages(*)')
    .single()

  if (error) throw new Error('Erro ao mover deal: ' + error.message)
  return data as Deal
}

export async function deleteDeal(id: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('deals').delete().eq('id', id)
  if (error) throw new Error('Erro ao excluir deal: ' + error.message)
}

// ============================================================
// Activities
// ============================================================

export async function listarActivities(params?: {
  contact_id?: string
  deal_id?: string
  tipo?: string
  page?: number
  pageSize?: number
}): Promise<{ data: Activity[]; total: number }> {
  const supabase = createServiceClient()
  const page = params?.page ?? 0
  const pageSize = Math.min(params?.pageSize ?? 50, 200)

  let query = supabase.from('activities').select('*', { count: 'exact' })

  if (params?.contact_id) {
    query = query.eq('contact_id', params.contact_id)
  }

  if (params?.deal_id) {
    query = query.eq('deal_id', params.deal_id)
  }

  if (params?.tipo) {
    query = query.eq('tipo', params.tipo)
  }

  const { data, error, count } = await query
    .order('data_atividade', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) throw new Error('Erro ao listar atividades: ' + error.message)
  return { data: (data ?? []) as Activity[], total: count ?? 0 }
}

export async function createActivity(formData: ActivityFormData): Promise<Activity> {
  const parsed = activitySchema.parse(formData)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('activities')
    .insert({
      contact_id: parsed.contact_id || null,
      deal_id: parsed.deal_id || null,
      tipo: parsed.tipo,
      descricao: parsed.descricao,
      responsavel: parsed.responsavel || null,
      concluido: parsed.concluido,
    })
    .select()
    .single()

  if (error) throw new Error('Erro ao criar atividade: ' + error.message)
  return data as Activity
}

// ============================================================
// CRM Dashboard Data
// ============================================================

export async function getCrmDashboardData(): Promise<CrmDashboardData> {
  const supabase = createServiceClient()

  // Busca stages primeiro para usar nas queries
  const { data: allStages } = await supabase
    .from('pipeline_stages')
    .select('id, nome')

  const stageNomesFechados = ['Fechado']
  const stageIdsFechados = (allStages ?? [])
    .filter(s => stageNomesFechados.includes(s.nome))
    .map(s => s.id)

  const stageIdsAbertos = (allStages ?? [])
    .filter(s => !['Fechado', 'Perdido'].includes(s.nome))
    .map(s => s.id)

  const [
    totalContatosRes,
    dealsAbertosRes,
    dealsDataRes,
    closedDealsRes,
    contatosPorVendedorRes,
    dealsPorStageRes,
    leadsPorOrigemRes,
    atividadesRecentesRes,
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    stageIdsAbertos.length > 0
      ? supabase.from('deals').select('*', { count: 'exact', head: true }).in('stage_id', stageIdsAbertos)
      : { count: 0 },
    supabase.from('deals').select('valor, stage_id'),
    stageIdsFechados.length > 0
      ? supabase.from('deals').select('id', { count: 'exact', head: true }).in('stage_id', stageIdsFechados)
      : { count: 0 },
    supabase.from('contacts').select('vendedor').not('vendedor', 'eq', ''),
    supabase.from('deals').select('stage_id, valor'),
    supabase.from('contacts').select('origem'),
    supabase.from('activities').select('*').order('data_atividade', { ascending: false }).limit(10),
  ])

  const totalContatos = totalContatosRes.count
  const dealsAbertos = dealsAbertosRes.count
  const closedDealsCount = 'count' in closedDealsRes ? (closedDealsRes.count ?? 0) : 0
  void dealsDataRes // used for future date-based filtering

  const contatosPorVendedor = 'data' in contatosPorVendedorRes ? (contatosPorVendedorRes.data ?? []) : []
  const dealsPorStage = 'data' in dealsPorStageRes ? (dealsPorStageRes.data ?? []) : []
  const leadsPorOrigem = 'data' in leadsPorOrigemRes ? (leadsPorOrigemRes.data ?? []) : []
  const atividadesRecentes = 'data' in atividadesRecentesRes ? (atividadesRecentesRes.data ?? []) : []

  const valorPipeline = dealsPorStage
    .filter(d => d.stage_id)
    .reduce((acc, d) => acc + Number(d.valor ?? 0), 0)

  const contatosPorVendedorAgrupados = contatosPorVendedor.reduce<Record<string, number>>((acc, c) => {
    const v = c.vendedor || 'Sem vendedor'
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})

  const dealsPorStageAgrupados = dealsPorStage.reduce<Record<string, { total: number; valor: number }>>((acc, d) => {
    const s = d.stage_id
    if (!acc[s]) acc[s] = { total: 0, valor: 0 }
    acc[s].total++
    acc[s].valor += Number(d.valor ?? 0)
    return acc
  }, {})

  const stages = await listarPipelineStages()
  const stageMap = new Map(stages.map(s => [s.id, s.nome]))

  const leadsPorOrigemAgrupados = leadsPorOrigem.reduce<Record<string, number>>((acc, c) => {
    const o = c.origem || 'manual'
    acc[o] = (acc[o] || 0) + 1
    return acc
  }, {})

  return {
    total_contatos: totalContatos ?? 0,
    deals_abertos: dealsAbertos ?? 0,
    valor_pipeline: valorPipeline,
    taxa_conversao: Math.round((closedDealsCount / (totalContatos ?? 1)) * 100),
    deals_fechados_mes: closedDealsCount,
    contatos_por_vendedor: Object.entries(contatosPorVendedorAgrupados)
      .map(([vendedor, total]) => ({ vendedor, total }))
      .sort((a, b) => b.total - a.total),
    deals_por_stage: Object.entries(dealsPorStageAgrupados)
      .map(([stage_id, { total, valor }]) => ({
        stage_id,
        stage_nome: stageMap.get(stage_id) ?? 'Desconhecido',
        total,
        valor,
      }))
      .sort((a, b) => (stages.find(s => s.id === a.stage_id)?.ordem ?? 0) - (stages.find(s => s.id === b.stage_id)?.ordem ?? 0)),
    leads_por_origem: Object.entries(leadsPorOrigemAgrupados)
      .map(([origem, total]) => ({ origem, total }))
      .sort((a, b) => b.total - a.total),
    atividades_recentes: (atividadesRecentes ?? []) as Activity[],
  }
}
