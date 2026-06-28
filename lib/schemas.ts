import { z } from 'zod'

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
})

export type ReservaFormDataValidated = z.infer<typeof reservaSchema>
export type AdicionarParticipanteDataValidated = z.infer<typeof adicionarParticipanteSchema>
