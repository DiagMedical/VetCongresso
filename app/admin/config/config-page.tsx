'use client'

import { useState, useEffect } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { getConfiguracoes, salvarConfiguracao } from '@/lib/actions/admin'
import { EMAIL_CONFIG_KEYS, getEmailConfig } from '@/lib/email/config'
import { AdminSectionCard } from '@/components/admin/section-card'

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
    return (
      <AdminSectionCard
        title="Carregando configurações"
        description="Preparando as opções de e-mail e integrações."
      >
        <p className="text-sm text-muted">Carregando...</p>
      </AdminSectionCard>
    )
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="E-mail (Resend)"
        description="Configure as credenciais do Resend para enviar e-mails de confirmação, lembretes e notificações."
        icon={<Mail className="size-4" aria-hidden="true" />}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-background/60 p-4 font-mono text-xs leading-6 text-muted">
            ZAPI_INSTANCE=seu_instance_id<br />
            ZAPI_TOKEN=seu_token<br />
            ZAPI_ENABLED=0
          </div>
          <p className="text-xs text-muted">
            {emailConfig.resend_enabled === '1'
              ? 'Envio de e-mail ativado'
              : 'Envio de e-mail desativado. Altere "Ativar envio" para 1 quando as credenciais estiverem configuradas.'}
          </p>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Configurações do Banco"
        description="Salve as chaves do Resend no banco para permitir o envio automático."
      >
        <div className="space-y-4">
          {EMAIL_CONFIG_KEYS.map(({ chave, label, desc, placeholder, type }) => (
            <div key={chave}>
              <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
              <p className="mb-1 text-xs text-muted">{desc}</p>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type={type ?? 'text'}
                  value={emailConfig[chave]}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, [chave]: e.target.value }))
                  }
                  className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                  placeholder={placeholder}
                />
                <button
                  onClick={() => handleSave(chave, config[chave] ?? '')}
                  disabled={salvando === chave}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-3 text-xs text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 md:whitespace-nowrap"
                >
                  {salvando === chave ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      <div className="flex justify-end">
        <button
          onClick={load}
          className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-xs text-muted transition-colors hover:text-foreground"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Recarregar
        </button>
      </div>
    </div>
  )
}
