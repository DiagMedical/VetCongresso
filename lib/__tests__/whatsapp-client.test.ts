import { describe, it, expect } from 'vitest'
import { formatPhone } from '@/lib/whatsapp/client'

describe('formatPhone', () => {
  it('mantém 55 + 9 dígitos quando já formatado', () => {
    expect(formatPhone('5511999998888')).toBe('5511999998888')
  })

  it('adiciona 55 quando tem 11 dígitos sem DDI', () => {
    expect(formatPhone('11999998888')).toBe('5511999998888')
  })

  it('adiciona 55 quando tem 10 dígitos (telefone fixo)', () => {
    expect(formatPhone('1133334444')).toBe('551133334444')
  })

  it('remove caracteres não-dígitos', () => {
    expect(formatPhone('(11) 99999-8888')).toBe('5511999998888')
  })

  it('remove + e espaço com DDI', () => {
    expect(formatPhone('+55 (11) 99999-8888')).toBe('5511999998888')
  })

  it('trunca para 13 dígitos se maior', () => {
    expect(formatPhone('5511999998888000')).toBe('5511999998888')
  })
})
