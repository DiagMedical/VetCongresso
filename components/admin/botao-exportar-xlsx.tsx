'use client'

import { useState } from 'react'
import { FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  data: Record<string, unknown>[]
  filename?: string
  label?: string
}

export function BotaoExportarXLSX({
  data,
  filename = 'exportacao',
  label = 'Exportar XLSX',
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar')
      return
    }

    setLoading(true)
    try {
      const { exportToXLSX } = await import('@/lib/export')
      await exportToXLSX(data as never, filename)
      toast.success('Planilha exportada com sucesso')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao exportar planilha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 hover:border-accent/60 transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="size-4" />
      )}
      {loading ? 'Exportando…' : label}
    </button>
  )
}
