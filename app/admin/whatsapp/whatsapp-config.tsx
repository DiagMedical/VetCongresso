'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, RefreshCw } from 'lucide-react'
import { getConfiguracoes, salvarConfiguracao, listarMensagens, testarWhatsApp } from '@/lib/actions/admin'
import type { MensagemEnviada } from '@/lib/actions/admin'

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
      setTestResult(res.sucesso ? '✅ Enviado com sucesso!' : `❌ Erro: ${res.erro}`)
    } catch (err) {
      setTestResult(`❌ ${String(err)}`)
    }
    setTestLoading(false)
  }

  const envVars = [
    { chave: 'zapi_instance', label: 'Z-API Instance ID', desc: 'ID da instância no Z-API' },
    { chave: 'zapi_token', label: 'Z-API Token', desc: 'Token de autenticação da instância' },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Configuração da API</h3>
        <p className="mb-4 text-xs text-muted">
          Configure as credenciais do Z-API no arquivo <code>.env.local</code>:
        </p>
        <div className="space-y-3">
          <div className="rounded-md bg-muted/20 p-3 font-mono text-xs leading-6">
            ZAPI_INSTANCE=seu_instance_id<br />
            ZAPI_TOKEN=seu_token<br />
            ZAPI_ENABLED=0
          </div>
          <p className="text-xs text-muted">
            Altere <code>ZAPI_ENABLED</code> para <code>1</code> quando as credenciais estiverem configuradas.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Configurações do Banco</h3>
        <div className="space-y-4">
          {envVars.map(({ chave, label, desc }) => (
            <div key={chave}>
              <label className="mb-1 block text-xs text-muted">{label}</label>
              <p className="mb-1 text-xs text-muted">{desc}</p>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type="text"
                  value={config[chave] ?? ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [chave]: e.target.value }))}
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder={chave}
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
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Testar Envio</h3>
        <p className="mb-3 text-xs text-muted">
          Envie uma mensagem de confirmação para testar a integração. Informe o ID do inscrito.
        </p>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            placeholder="ID do inscrito"
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <button
            onClick={handleTest}
            disabled={testLoading || !testId.trim()}
            className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 md:whitespace-nowrap"
          >
            {testLoading ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
            Enviar
          </button>
        </div>
        {testResult && (
          <p className="mt-2 text-xs text-muted">{testResult}</p>
        )}
      </div>

      <div className="rounded-lg border border-border">
        <div className="flex flex-col gap-2 border-b border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted" />
            <h3 className="text-sm font-semibold text-foreground">Mensagens Enviadas</h3>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw className="size-3" />
            Atualizar
          </button>
        </div>
        {loading ? (
          <p className="p-4 text-center text-sm text-muted">Carregando...</p>
        ) : mensagens.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted">Nenhuma mensagem enviada ainda.</p>
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
                  <tr key={m.id} className="bg-background hover:bg-card/50 transition-colors">
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
                        <span className="text-xs text-success">✓ Enviado</span>
                      ) : (
                        <span className="text-xs text-danger" title={m.erro ?? ''}>
                          ✗ Falhou
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
      </div>
    </div>
  )
}
