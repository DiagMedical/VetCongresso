'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, RefreshCw } from 'lucide-react'
import { getConfiguracoes, salvarConfiguracao, listarMensagens, testarWhatsApp } from '@/lib/actions/admin'
import type { MensagemEnviada } from '@/lib/actions/admin'
import { AdminSectionCard } from '@/components/admin/section-card'

export function WhatsAppConfig() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [mensagens, setMensagens] = useState<MensagemEnviada[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [testId, setTestId] = useState('')
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [c, m] = await Promise.all([getConfiguracoes(), listarMensagens()])
    setConfig(c)
    setMensagens(m)
    setLoading(false)
  }

  async function handleSave(chave: string, valor: string) {
    setSalvando(chave)
    await salvarConfiguracao(chave, valor)
    setConfig((prev) => ({ ...prev, [chave]: valor }))
    setSalvando(null)
  }

  async function handleTest() {
    if (!testId.trim()) return
    setTestLoading(true)
    setTestResult(null)
    try {
      const res = await testarWhatsApp(testId.trim())
      setTestResult(res.sucesso ? 'Enviado com sucesso!' : `Erro: ${res.erro}`)
    } catch (err) {
      setTestResult(`Erro: ${String(err)}`)
    }
    setTestLoading(false)
  }

  const envVars = [
    { chave: 'zapi_instance', label: 'Z-API Instance ID', desc: 'ID da instância no Z-API' },
    { chave: 'zapi_token', label: 'Z-API Token', desc: 'Token de autenticação da instância' },
  ]

  if (loading) {
    return (
      <AdminSectionCard
        title="Carregando configurações"
        description="Preparando os dados do WhatsApp e do histórico de mensagens."
      >
        <p className="text-sm text-muted">Carregando...</p>
      </AdminSectionCard>
    )
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Configuração da API"
        description="Configure as credenciais do Z-API no arquivo .env.local e ative o envio quando estiver pronto."
        icon={<MessageSquare className="size-4" aria-hidden="true" />}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-background/60 p-3 font-mono text-xs leading-6 text-muted">
            ZAPI_INSTANCE=seu_instance_id<br />
            ZAPI_TOKEN=seu_token<br />
            ZAPI_ENABLED=0
          </div>
          <p className="text-xs text-muted">
            Altere <code>ZAPI_ENABLED</code> para <code>1</code> quando as credenciais estiverem configuradas.
          </p>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Configurações do Banco"
        description="Os valores abaixo são salvos no banco e usados pela rotina de envio."
      >
        <div className="space-y-4">
          {envVars.map(({ chave, label, desc }) => (
            <div key={chave}>
              <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
              <p className="mb-1 text-xs text-muted">{desc}</p>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type="text"
                  value={config[chave] ?? ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [chave]: e.target.value }))}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                  placeholder={chave}
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

      <AdminSectionCard
        title="Testar Envio"
        description="Envie uma mensagem para confirmar que a integração está funcionando."
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="text"
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              placeholder="ID do inscrito"
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            />
            <button
              onClick={handleTest}
              disabled={testLoading || !testId.trim()}
              className="inline-flex h-11 items-center gap-1 rounded-xl bg-primary px-4 text-sm text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 md:whitespace-nowrap"
            >
              {testLoading ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
              Enviar
            </button>
          </div>
          {testResult && <p className="text-xs text-muted">{testResult}</p>}
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Mensagens Enviadas"
        description={`${mensagens.length} mensagem(ns) registradas no histórico.`}
      >
        <div className="flex justify-end pb-3">
          <button
            onClick={load}
            className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs text-muted transition-colors hover:text-foreground"
          >
            <RefreshCw className="size-3" />
            Atualizar
          </button>
        </div>
        {mensagens.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nenhuma mensagem enviada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-card">
                <tr className="text-left text-muted">
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Telefone</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Mensagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mensagens.map((m) => (
                  <tr key={m.id} className="bg-background transition-colors hover:bg-card/50">
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(m.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-foreground">{m.telefone}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted/20 px-2 py-0.5 text-xs text-muted">
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.sucesso ? (
                        <span className="text-xs text-success">Enviado</span>
                      ) : (
                        <span className="text-xs text-danger" title={m.erro ?? ''}>
                          Falhou
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-muted" title={m.mensagem}>
                      {m.mensagem}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>
    </div>
  )
}
