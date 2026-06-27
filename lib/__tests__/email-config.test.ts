import { describe, it, expect } from 'vitest'
import { getEmailConfig } from '@/lib/email/config'

describe('getEmailConfig', () => {
  it('retorna valores padrão quando config vazio', () => {
    const cfg = getEmailConfig({})
    expect(cfg).toEqual({
      resend_api_key: '',
      resend_from_email: '',
      resend_from_name: 'ABRAVEQ 2026',
      resend_enabled: '0',
    })
  })

  it('usa valores fornecidos', () => {
    const cfg = getEmailConfig({
      resend_api_key: 're_123',
      resend_from_email: 'noreply@test.com',
      resend_from_name: 'Teste',
      resend_enabled: '1',
    })
    expect(cfg).toEqual({
      resend_api_key: 're_123',
      resend_from_email: 'noreply@test.com',
      resend_from_name: 'Teste',
      resend_enabled: '1',
    })
  })

  it('usa valores parciais com fallback nos padrão', () => {
    const cfg = getEmailConfig({ resend_api_key: 're_abc' })
    expect(cfg.resend_api_key).toBe('re_abc')
    expect(cfg.resend_from_email).toBe('')
    expect(cfg.resend_from_name).toBe('ABRAVEQ 2026')
    expect(cfg.resend_enabled).toBe('0')
  })
})
