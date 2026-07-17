'use client'

import { useState, useEffect } from 'react'
import { Mail, RefreshCw, X, UserPlus, Users, Stethoscope, Syringe, Eye, EyeOff } from 'lucide-react'
import { getConfiguracoes, salvarConfiguracao } from '@/lib/actions/admin'
import { EMAIL_CONFIG_KEYS, getEmailConfig } from '@/lib/email/config'
import { INTERESSES_VET_PADRAO, INTERESSES_HUMANO_PADRAO } from '@/lib/interesses'
import { AdminSectionCard } from '@/components/admin/section-card'
import { toast } from 'sonner'

export function ConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [novoVendedor, setNovoVendedor] = useState('')
  const [novoInteresseVet, setNovoInteresseVet] = useState('')
  const [novoInteresseHumano, setNovoInteresseHumano] = useState('')

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

  function getVendedores(): string[] {
    try {
      const raw = config['vendedores']
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  async function adicionarVendedor() {
    const nome = novoVendedor.trim()
    if (!nome) return
    const atual = getVendedores()
    if (atual.includes(nome)) {
      toast.error('Vendedor já cadastrado')
      return
    }
    await handleSave('vendedores', JSON.stringify([...atual, nome]))
    setNovoVendedor('')
    toast.success('Vendedor adicionado!')
  }

  async function removerVendedor(nome: string) {
    const atual = getVendedores()
    await handleSave('vendedores', JSON.stringify(atual.filter((v) => v !== nome)))
    toast.success('Vendedor removido!')
  }

  function getLista(chave: string): string[] {
    try {
      const raw = config[chave]
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const emailConfig = getEmailConfig(config)
  const vendedores = getVendedores()
  const interessesVet = getLista('interesses_vet')
  const interessesHumano = getLista('interesses_humano')

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

      <AdminSectionCard
        title="Vendedores"
        description="Gerencie a lista de vendedores que aparecerá como opção nos formulários de cadastro."
        icon={<Users className="size-4" aria-hidden="true" />}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="text"
              value={novoVendedor}
              onChange={(e) => setNovoVendedor(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarVendedor() } }}
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Nome do vendedor"
            />
            <button
              onClick={adicionarVendedor}
              disabled={!novoVendedor.trim() || salvando === 'vendedores'}
              className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-xs text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Adicionar
            </button>
          </div>

          {vendedores.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {vendedores.map((nome) => (
                <div
                  key={nome}
                  className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-medium text-foreground ring-1 ring-border"
                >
                  {nome}
                  <button
                    onClick={() => removerVendedor(nome)}
                    className="rounded-full p-0.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label={`Remover ${nome}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Nenhum vendedor cadastrado.</p>
          )}
        </div>
      </AdminSectionCard>

      {/* Interesses — Veterinária */}
      <AdminSectionCard
        title="Interesses — Veterinária"
        description="Lista de equipamentos/interesses da área veterinária. Aparece como chips no formulário de contato."
        icon={<Stethoscope className="size-4 text-primary" aria-hidden="true" />}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="text"
              value={novoInteresseVet}
              onChange={(e) => setNovoInteresseVet(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).closest('form')?.querySelector('button')?.click() } }}
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Novo interesse veterinário"
            />
            <button
              onClick={async () => {
                const item = novoInteresseVet.trim()
                if (!item) return
                const atual = interessesVet
                if (atual.includes(item)) { toast.error('Item já cadastrado'); return }
                await handleSave('interesses_vet', JSON.stringify([...atual, item]))
                setNovoInteresseVet('')
                toast.success('Item adicionado!')
              }}
              disabled={!novoInteresseVet.trim() || salvando === 'interesses_vet'}
              className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-xs text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Adicionar
            </button>
          </div>

          {interessesVet.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interessesVet.map((item) => (
                <div key={item} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/20">
                  {item}
                  <button
                    onClick={async () => {
                      const atual = interessesVet
                      await handleSave('interesses_vet', JSON.stringify(atual.filter((i: string) => i !== item)))
                      toast.success('Item removido!')
                    }}
                    className="rounded-full p-0.5 text-primary/60 transition-colors hover:text-danger"
                    aria-label={`Remover ${item}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted mb-2">Usando lista padrão. Os itens abaixo aparecem no formulário:</p>
              <div className="flex flex-wrap gap-2">
                {INTERESSES_VET_PADRAO.map(item => (
                  <span key={item} className="rounded-full bg-primary/5 px-3 py-1.5 text-sm text-muted ring-1 ring-border">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </AdminSectionCard>

      {/* Interesses — Humana */}
      <AdminSectionCard
        title="Interesses — Humana"
        description="Lista de equipamentos/interesses da área humana. Aparece como chips no formulário de contato."
        icon={<Syringe className="size-4 text-accent" aria-hidden="true" />}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="text"
              value={novoInteresseHumano}
              onChange={(e) => setNovoInteresseHumano(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).closest('form')?.querySelector('button')?.click() } }}
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Novo interesse humano"
            />
            <button
              onClick={async () => {
                const item = novoInteresseHumano.trim()
                if (!item) return
                const atual = interessesHumano
                if (atual.includes(item)) { toast.error('Item já cadastrado'); return }
                await handleSave('interesses_humano', JSON.stringify([...atual, item]))
                setNovoInteresseHumano('')
                toast.success('Item adicionado!')
              }}
              disabled={!novoInteresseHumano.trim() || salvando === 'interesses_humano'}
              className="inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-xs text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Adicionar
            </button>
          </div>

          {interessesHumano.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interessesHumano.map((item) => (
                <div key={item} className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent ring-1 ring-accent/20">
                  {item}
                  <button
                    onClick={async () => {
                      const atual = interessesHumano
                      await handleSave('interesses_humano', JSON.stringify(atual.filter((i: string) => i !== item)))
                      toast.success('Item removido!')
                    }}
                    className="rounded-full p-0.5 text-accent/60 transition-colors hover:text-danger"
                    aria-label={`Remover ${item}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted mb-2">Usando lista padrão. Os itens abaixo aparecem no formulário:</p>
              <div className="flex flex-wrap gap-2">
                {INTERESSES_HUMANO_PADRAO.map(item => (
                  <span key={item} className="rounded-full bg-accent/5 px-3 py-1.5 text-sm text-muted ring-1 ring-border">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </AdminSectionCard>

      {/* Dashboard Config */}
      <AdminSectionCard
        title="Dashboard"
        description="Escolha quais seções aparecem no Dashboard."
        icon={<Eye className="size-4" aria-hidden="true" />}
      >
        {(['funil_conversao', 'ranking_vendedores', 'deals_recentes', 'tempo_pipeline', 'leads_followup', 'deals_parados', 'atividades_recentes'] as const).map(s => {
          const ativas = getLista('dashboard_sections')
          const ativa = ativas.length === 0 || ativas.includes(s)
          return (
            <label key={s} className="flex items-center gap-3 py-2 cursor-pointer">
              <button
                onClick={async () => {
                  const atual = ativas.length > 0 ? ativas : ['funil_conversao', 'ranking_vendedores', 'deals_recentes', 'tempo_pipeline', 'leads_followup', 'deals_parados', 'atividades_recentes']
                  const nova = atual.includes(s) ? atual.filter((i: string) => i !== s) : [...atual, s]
                  await handleSave('dashboard_sections', JSON.stringify(nova))
                }}
                className={`flex size-5 items-center justify-center rounded border transition-colors ${
                  ativa ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                }`}
              >
                {ativa && <span className="text-[10px]">✓</span>}
              </button>
              <span className="text-sm text-foreground flex-1 capitalize">{s.replace(/_/g, ' ')}</span>
              {ativa ? <Eye className="size-3 text-primary" /> : <EyeOff className="size-3 text-muted" />}
            </label>
          )
        })}
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
