'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileDown, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { AdminSectionCard } from '@/components/admin/section-card'
import { Button } from '@/components/ui/button'
import { importarLeadsCSV } from '@/lib/actions/crm'

export function ImportClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvText, setCsvText] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({})
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<{ total: number; sucesso: number; erros: string[] } | null>(null)

  const COLUNAS = [
    { chave: 'nome', label: 'Nome *', obrigatorio: true },
    { chave: 'email', label: 'Email', obrigatorio: false },
    { chave: 'telefone', label: 'Telefone', obrigatorio: false },
    { chave: 'empresa', label: 'Empresa (vet/humana)', obrigatorio: false },
    { chave: 'evento', label: 'Evento', obrigatorio: false },
    { chave: 'vendedor', label: 'Vendedor', obrigatorio: false },
    { chave: 'interesses_vet', label: 'Interesses Vet (separados por ;)', obrigatorio: false },
    { chave: 'interesses_humano', label: 'Interesses Humano (separados por ;)', obrigatorio: false },
    { chave: 'observacoes', label: 'Observações', obrigatorio: false },
  ]

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setCsvText(text)
      const lines = text.split('\n').filter(Boolean)
      if (lines.length > 0) {
        const cols = lines[0].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
        setHeaders(cols)
        // Auto-mapeamento
        const auto: Record<string, string> = {}
        cols.forEach((c, i) => {
          const key = c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
          if (key.includes('nome')) auto.nome = String(i)
          else if (key.includes('email')) auto.email = String(i)
          else if (key.includes('telefone') || key.includes('tel') || key.includes('whats') || key.includes('fone')) auto.telefone = String(i)
          else if (key.includes('empresa')) auto.empresa = String(i)
          else if (key.includes('evento')) auto.evento = String(i)
          else if (key.includes('vendedor')) auto.vendedor = String(i)
        })
        setMapeamento(auto)
        setResultado(null)
      }
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!csvText || !mapeamento.nome) {
      toast.error('Selecione um arquivo e mapeie a coluna Nome')
      return
    }
    setImportando(true)
    try {
      const res = await importarLeadsCSV(csvText, mapeamento)
      setResultado(res)
      if (res.sucesso > 0) {
        toast.success(`${res.sucesso} leads importados!`)
        router.refresh()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro na importação')
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <AdminSectionCard
        title="Upload do Arquivo"
        description="Selecione um arquivo CSV com os dados dos leads. A primeira linha deve conter os nomes das colunas."
        icon={<Upload className="size-4" />}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:brightness-110"
            />
            <a
              href="/modelo-importar-leads.csv"
              download
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <FileDown className="size-3" />
              Baixar modelo
            </a>
          </div>
        </div>
      </AdminSectionCard>

      {/* Mapeamento */}
      {headers.length > 0 && (
        <AdminSectionCard
          title="Mapear Colunas"
          description="Associe as colunas do seu CSV aos campos do CRM."
        >
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-[500px] w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted">Campo CRM</th>
                    <th className="px-3 py-2 text-left font-medium text-muted">Coluna do CSV</th>
                  </tr>
                </thead>
                <tbody>
                  {COLUNAS.map(col => (
                    <tr key={col.chave} className="border-b border-border">
                      <td className="px-3 py-2">
                        <span className="text-foreground">{col.label}</span>
                        {col.obrigatorio && <span className="text-red-400 ml-1">*</span>}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={mapeamento[col.chave] ?? ''}
                          onChange={e => setMapeamento(prev => ({ ...prev, [col.chave]: e.target.value }))}
                          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                        >
                          <option value="">— Não importar —</option>
                          {headers.map((h, i) => (
                            <option key={i} value={String(i)}>{h}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                {csvText.split('\n').filter(Boolean).length - 1} linhas detectadas
              </p>
              <Button onClick={handleImport} disabled={importando || !mapeamento.nome} className="gap-2">
                {importando ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {importando ? 'Importando...' : 'Importar Leads'}
              </Button>
            </div>
          </div>
        </AdminSectionCard>
      )}

      {/* Resultado */}
      {resultado && (
        <AdminSectionCard
          title="Resultado da Importação"
          icon={resultado.erros.length === 0 ? <CheckCircle2 className="size-4 text-green-400" /> : <AlertTriangle className="size-4 text-yellow-400" />}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-foreground">Total: <strong>{resultado.total}</strong></span>
              <span className="text-green-400">Sucesso: <strong>{resultado.sucesso}</strong></span>
              <span className="text-red-400">Erros: <strong>{resultado.erros.length}</strong></span>
            </div>
            {resultado.erros.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {resultado.erros.map((err, i) => (
                  <p key={i} className="flex items-start gap-2 text-xs text-red-400">
                    <XCircle className="size-3 shrink-0 mt-0.5" />
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>
        </AdminSectionCard>
      )}
    </div>
  )
}
