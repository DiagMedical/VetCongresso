// ============================================================
// Tipos do CRM
// ============================================================

export type DealStageType = 'novo_lead' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido'

export interface PipelineStage {
  id: string
  nome: string
  ordem: number
  cor: string
  probabilidade: number
  created_at: string
}

export interface Contact {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  origem: string
  vendedor: string | null
  observacoes: string | null
  tags: string[]
  interesses_vet: string[]
  interesses_humano: string[]
  empresa: string | null
  evento: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  titulo: string
  contact_id: string
  contact?: Contact
  valor: number
  stage_id: string
  stage?: PipelineStage
  vendedor: string | null
  descricao: string | null
  data_fechamento: string | null
  motivo_perda: string | null
  stage_moved_at: string | null
  created_at: string
  updated_at: string
}

export type ActivityTipo = 'nota' | 'call' | 'email' | 'whatsapp' | 'meeting' | 'task'

export interface Activity {
  id: string
  contact_id: string | null
  deal_id: string | null
  tipo: ActivityTipo
  descricao: string | null
  responsavel: string | null
  data_atividade: string
  concluido: boolean
}

export interface CrmDashboardData {
  total_contatos: number
  deals_abertos: number
  valor_pipeline: number
  valor_pipeline_ponderado: number
  taxa_conversao: number
  deals_fechados_mes: number
  deals_por_stage: { stage_id: string; stage_nome: string; total: number; valor: number; probabilidade: number }[]
  ranking_vendedores: { vendedor: string; total_deals: number; valor_total: number }[]
  deals_recentes: (Deal & { contact?: Contact | null; stage?: PipelineStage | null })[]
  atividades_recentes: Activity[]
  leads_sem_followup: (Contact & { ultima_atividade?: string | null })[]
  deals_parados: (Deal & { contact?: Contact | null; stage?: PipelineStage | null; dias_parado: number })[]
  tempo_medio_por_stage: { stage_id: string; stage_nome: string; total_deals: number; dias_medio: number }[]
}

// ============================================================
// Tipos Legados (VetCongresso)
// ============================================================

export type StatusInscricao = 'confirmado' | 'check-in' | 'cancelado_por_falta' | 'espera'
export type OrigemInscricao = 'site' | 'manual'
export type DiaEvento = 1 | 2 | 3

export interface Palestra {
  id: string
  dia_evento: DiaEvento
  tema: string
  palestrante: string
  descricao: string | null
  horario_inicio: string
  horario_fim: string
  vagas_totais: number
  vagas_restantes?: number
  ativo: boolean
  created_at: string
}

export interface Inscrito {
  id: string
  palestra_id: string
  nome: string
  email: string
  telefone: string
  status: StatusInscricao
  origem: OrigemInscricao
  vendedor?: string | null
  checkin_at: string | null
  cancelado_at: string | null
  created_at: string
  palestra?: Palestra
}

export interface Admin {
  id: string
  nome: string
  email: string
  created_at: string
}

export interface PalestraFormData {
  dia_evento: DiaEvento
  tema: string
  palestrante: string
  descricao?: string
  horario_inicio: string
  horario_fim: string
  vagas_totais: number
}

export interface ReservaFormData {
  palestra_id: string
  nome: string
  email: string
  telefone: string
  aceite_lgpd: boolean
  vendedor?: string
}
