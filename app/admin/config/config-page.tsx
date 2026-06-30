'use client'

import { useState, useEffect } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { getConfiguracoes, salvarConfiguracao } from '@/lib/actions/admin'
import { EMAIL_CONFIG_KEYS, getEmailConfig } from '@/lib/email/config'

export function ConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const c = await getConfiguracoes()
    setConfig(c)
    setLoading(false)
  }

  async function handleSave(chave: string, valor: string) {
    setSalvando(chave)
    await salvarConfiguracao(chave, valor)
    setConfig((prev) => ({ ...prev, [chave]: valor }))
    setSalvando(null)
  }

  const emailConfig = getEmailConfig(config)

  if (loading) {
    return <p className="text-sm text-muted">Carregando...</p>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="size-4 text-muted" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">E-mail (Resend)</h3>
        </div>

        <p className="mb-4 text-xs text-muted">
          Configure as credenciais do Resend para enviar e-mails de confirmação, lembretes e notificações.
        </p>

        <div className="space-y-4">
          {EMAIL_CONFIG_KEYS.map(({ chave, label, desc, placeholder, type }) => (
            <div key={chave}>
              <label className="mb-1 block text-xs text-muted">{label}</label>
              <p className="mb-1 text-xs text-muted">{desc}</p>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type={type ?? 'text'}
                  value={emailConfig[chave]}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, [chave]: e.target.value }))
                  }
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder={placeholder}
                />
                <button
                  onClick={() => handleSave(chave, config[chave] ?? '')}
                  disabled={salvando === chave}
                  className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 md:whitespace-nowrap"
                >
                  {salvando === chave ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md bg-muted/20 p-3 font-mono text-xs">
          {emailConfig.resend_enabled === '1'
            ? '✅ Envio de e-mail ativado'
            : '⏸️ Envio de e-mail desativado. Altere "Ativar envio" para 1 quando as credenciais estiverem configuradas.'}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={load}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Recarregar
        </button>
      </div>
    </div>
  )
}
