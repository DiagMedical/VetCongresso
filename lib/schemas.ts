import { z } from 'zod'

// ============================================================
// CRM Schemas
// ============================================================

export const contactSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(120, 'Nome muito longo'),
  email: z.string().email('E-mail inválido').max(255, 'E-mail muito longo').optional().or(z.literal('')),
  telefone: z.string().max(20, 'Telefone muito longo').optional().or(z.literal('')),
  origem: z.string().max(60, 'Origem muito longa').default('manual'),
  vendedor: z.string().max(60, 'Nome do vendedor muito longo').optional().or(z.literal('')),
  observacoes: z.string().max(1000, 'Observações muito longas').optional().or(z.literal('')),
  tags: z.array(z.string().max(30)).max(10, 'Máximo de 10 tags').default([]),
})

export const dealSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200, 'Título muito longo'),
  contact_id: z.string().uuid('Contato inválido'),
  valor: z.number().min(0, 'Valor não pode ser negativo').default(0),
  stage_id: z.string().uuid('Estágio inválido'),
  vendedor: z.string().max(60, 'Nome do vendedor muito longo').optional().or(z.literal('')),
  descricao: z.string().max(2000, 'Descrição muito longa').optional().or(z.literal('')),
  data_fechamento: z.string().optional().or(z.literal('')),
  motivo_perda: z.string().max(500, 'Motivo muito longo').optional().or(z.literal('')),
})

export const pipelineStageSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(60, 'Nome muito longo'),
  ordem: z.number().int('Ordem deve ser inteiro').min(0),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser hexadecimal (#RRGGBB)').default('#3B82F6'),
  probabilidade: z.number().int().min(0).max(100).default(0),
})

export const activitySchema = z.object({
  contact_id: z.string().uuid('Contato inválido').nullable().optional(),
  deal_id: z.string().uuid('Deal inválido').nullable().optional(),
  tipo: z.enum(['nota', 'call', 'email', 'whatsapp', 'meeting', 'task']),
  descricao: z.string().min(1, 'Descrição é obrigatória').max(2000, 'Descrição muito longa'),
  responsavel: z.string().max(60, 'Nome do responsável muito longo').optional().or(z.literal('')),
  concluido: z.boolean().default(true),
})

export type ContactFormData = z.infer<typeof contactSchema>
export type DealFormData = z.infer<typeof dealSchema>
export type PipelineStageFormData = z.infer<typeof pipelineStageSchema>
export type ActivityFormData = z.infer<typeof activitySchema>

// ============================================================
// Schemas Legados (VetCongresso)
// ============================================================

export const reservaSchema = z.object({
  palestra_id: z.string().uuid('ID da palestra inválido'),
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(120, 'Nome muito longo'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(255, 'E-mail muito longo'),
  telefone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(20, 'Telefone muito longo')
    .regex(/^[\d\s()+-]+$/, 'Telefone inválido'),
  aceite_lgpd: z
    .boolean()
    .refine((v) => v === true, 'Aceite da LGPD é obrigatório'),
  vendedor: z.string().max(60, 'Nome do vendedor muito longo').optional(),
})

export const adicionarParticipanteSchema = z.object({
  palestra_id: z.string().uuid('ID da palestra inválido'),
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(120, 'Nome muito longo'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(255, 'E-mail muito longo'),
  telefone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(20, 'Telefone muito longo')
    .regex(/^[\d\s()+-]+$/, 'Telefone inválido'),
  vendedor: z.string().max(60, 'Nome do vendedor muito longo').optional(),
})

export const sorteioSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(120, 'Nome muito longo'),
  whatsapp: z
    .string()
    .min(10, 'WhatsApp deve ter no mínimo 10 dígitos')
    .max(20, 'WhatsApp muito longo'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(255, 'E-mail muito longo'),
  vendedor: z.string().max(60, 'Nome do vendedor muito longo').optional(),
})

export type ReservaFormDataValidated = z.infer<typeof reservaSchema>
export type AdicionarParticipanteDataValidated = z.infer<typeof adicionarParticipanteSchema>
