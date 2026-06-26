export interface EmailConfig {
  resend_api_key: string
  resend_from_email: string
  resend_from_name: string
  resend_enabled: string
}

export const EMAIL_CONFIG_KEYS: { chave: keyof EmailConfig; label: string; desc: string; placeholder: string; type?: string }[] = [
  {
    chave: 'resend_api_key',
    label: 'Resend API Key',
    desc: 'Chave de API do Resend (re_...)',
    placeholder: 're_xxxxxxxxxxxx',
    type: 'password',
  },
  {
    chave: 'resend_from_email',
    label: 'E-mail de envio',
    desc: 'Endereço de e-mail verificado no Resend',
    placeholder: 'noreply@seudominio.com',
  },
  {
    chave: 'resend_from_name',
    label: 'Nome do remetente',
    desc: 'Nome exibido como remetente dos e-mails',
    placeholder: 'ABRAVEQ 2026',
  },
  {
    chave: 'resend_enabled',
    label: 'Ativar envio',
    desc: 'Altere para 1 quando as credenciais estiverem configuradas',
    placeholder: '0',
  },
]

export function getEmailConfig(configs: Record<string, string>): EmailConfig {
  return {
    resend_api_key: configs.resend_api_key ?? '',
    resend_from_email: configs.resend_from_email ?? '',
    resend_from_name: configs.resend_from_name ?? 'ABRAVEQ 2026',
    resend_enabled: configs.resend_enabled ?? '0',
  }
}
