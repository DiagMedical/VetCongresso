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
}
