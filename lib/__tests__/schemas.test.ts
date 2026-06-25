import { describe, it, expect } from 'vitest'
import { reservaSchema, adicionarParticipanteSchema } from '@/lib/schemas'

const validReserva = {
  palestra_id: '550e8400-e29b-41d4-a716-446655440000',
  nome: 'João Silva',
  email: 'joao@email.com',
  telefone: '(11) 99999-8888',
  aceite_lgpd: true,
}

const validParticipante = {
  palestra_id: '550e8400-e29b-41d4-a716-446655440000',
  nome: 'Maria Souza',
  email: 'maria@email.com',
  telefone: '(11) 97777-6666',
}

describe('reservaSchema', () => {
  it('accepts valid data', () => {
    const result = reservaSchema.safeParse(validReserva)
    expect(result.success).toBe(true)
  })

  it('rejects short nome', () => {
    const result = reservaSchema.safeParse({ ...validReserva, nome: 'Jo' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = reservaSchema.safeParse({ ...validReserva, email: 'invalido' })
    expect(result.success).toBe(false)
  })

  it('rejects telefone with less than 10 digits', () => {
    const result = reservaSchema.safeParse({ ...validReserva, telefone: '119999' })
    expect(result.success).toBe(false)
  })

  it('rejects when aceite_lgpd is false', () => {
    const result = reservaSchema.safeParse({ ...validReserva, aceite_lgpd: false })
    expect(result.success).toBe(false)
  })

  it('rejects invalid palestra_id', () => {
    const result = reservaSchema.safeParse({ ...validReserva, palestra_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('accepts telefone with formatting characters', () => {
    const result = reservaSchema.safeParse({ ...validReserva, telefone: '+55 (11) 99999-8888' })
    expect(result.success).toBe(true)
  })
})

describe('adicionarParticipanteSchema', () => {
  it('accepts valid data', () => {
    const result = adicionarParticipanteSchema.safeParse(validParticipante)
    expect(result.success).toBe(true)
  })

  it('accepts data without aceite_lgpd (schema does not require it)', () => {
    const result = adicionarParticipanteSchema.safeParse(validParticipante)
    expect(result.success).toBe(true)
  })
})
