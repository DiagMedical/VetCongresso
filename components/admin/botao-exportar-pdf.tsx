'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  containerId: string
  filename?: string
}

export function BotaoExportarPDF({ containerId, filename = 'relatorio' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { exportarRelatorioPDF } = await import('@/lib/export')
      await exportarRelatorioPDF(containerId, filename)
      toast.success('PDF exportado com sucesso')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao exportar PDF')
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
        <FileDown className="size-4" />
      )}
      {loading ? 'Exportando…' : 'Exportar PDF'}
    </button>
  )
}