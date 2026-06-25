import { describe, it, expect } from 'vitest'
import { confirmacaoMsg, esperaMsg, checkinMsg, promovidoMsg, lembreteMsg, cancelamentoMsg } from '@/lib/whatsapp/messages'
import type { Inscrito, Palestra } from '@/types'

const palestra: Palestra = {
  id: 'p1',
  dia_evento: 1,
  tema: 'Anestesia em Pequenos Animais',
  palestrante: 'Dr. Silva',
  descricao: null,
  horario_inicio: '2026-07-01T09:00:00-03:00',
  horario_fim: '2026-07-01T10:00:00-03:00',
  vagas_totais: 20,
  vagas_restantes: 15,
  ativo: true,
  created_at: '',
}

const inscrito: Inscrito = {
  id: 'i1',
  palestra_id: 'p1',
  nome: 'João Silva',
  email: 'joao@email.com',
  telefone: '+5511999998888',
  status: 'confirmado',
  origem: 'site',
  checkin_at: null,
  cancelado_at: null,
  created_at: '',
  palestra,
}

describe('confirmacaoMsg', () => {
  it('includes nome and tema', () => {
    const msg = confirmacaoMsg(inscrito)
    expect(msg).toContain('João Silva')
    expect(msg).toContain('Anestesia em Pequenos Animais')
    expect(msg).toContain('Reserva Confirmada')
  })
})

describe('esperaMsg', () => {
  it('indicates waiting list', () => {
    const msg = esperaMsg(inscrito)
    expect(msg).toContain('Lista de Espera')
    expect(msg).toContain('João Silva')
  })
})

describe('checkinMsg', () => {
  it('confirms check-in', () => {
    const msg = checkinMsg(inscrito)
    expect(msg).toContain('Check-in Realizado')
    expect(msg).toContain('João Silva')
  })
})

describe('promovidoMsg', () => {
  it('notifies promotion', () => {
    const msg = promovidoMsg(inscrito)
    expect(msg).toContain('Vaga Liberada')
    expect(msg).toContain('Anestesia em Pequenos Animais')
  })
})

describe('lembreteMsg', () => {
  it('includes lecture details', () => {
    const msg = lembreteMsg(inscrito)
    expect(msg).toContain('Lembrete')
    expect(msg).toContain('Anestesia em Pequenos Animais')
    expect(msg).toContain('Dr. Silva')
  })
})

describe('cancelamentoMsg', () => {
  it('informs cancellation', () => {
    const msg = cancelamentoMsg(inscrito)
    expect(msg).toContain('Reserva Cancelada')
    expect(msg).toContain('João Silva')
  })
})
