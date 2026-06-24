export interface ZapEnvio {
  sucesso: boolean
  zaapId?: string
  erro?: string
}

function getConfig() {
  return {
    instance: process.env.ZAPI_INSTANCE ?? '',
    token: process.env.ZAPI_TOKEN ?? '',
    enabled: process.env.ZAPI_ENABLED === '1',
  }
}

function formatPhone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('55')) return digits
  if (digits.length === 10) return `55${digits}`
  if (digits.length === 11 && !digits.startsWith('55')) return `55${digits}`
  if (digits.length >= 13) return digits.slice(0, 13)
  return `55${digits.padStart(10, '55')}`
}

export async function sendText(telefone: string, message: string): Promise<ZapEnvio> {
  const { instance, token, enabled } = getConfig()

  if (!enabled) {
    console.log('[WhatsApp mock] Para:', telefone, 'Msg:', message)
    return { sucesso: true, zaapId: 'mock' }
  }

  if (!instance || !token) {
    console.warn('[WhatsApp] ZAPI_INSTANCE ou ZAPI_TOKEN não configurados')
    return { sucesso: false, erro: 'API não configurada' }
  }

  const phone = formatPhone(telefone)

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${instance}/token/${token}/send-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      return { sucesso: false, erro: `HTTP ${res.status}: ${text}` }
    }

    const data = await res.json()
    return { sucesso: true, zaapId: data.zaapId }
  } catch (err) {
    return { sucesso: false, erro: String(err) }
  }
}
