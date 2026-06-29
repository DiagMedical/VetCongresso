'use client'

import { useState, useEffect } from 'react'
import { Loader2, Inbox } from 'lucide-react'
import type { Inscrito } from '@/types'
import { formatDate } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface VerInscritosDialogProps {
  open: boolean
  onClose: () => void
  palestraId: string
  palestraNome: string
}

const statusLabels: Record<string, string> = {
  confirmado: 'Confirmado',
  'check-in': 'Check-in',
  cancelado_por_falta: 'Cancelado',
  espera: 'Espera',
}

const statusColors: Record<string, string> = {
  confirmado: 'bg-primary/10 text-primary',
  'check-in': 'bg-success/10 text-success',
  cancelado_por_falta: 'bg-danger/10 text-danger',
  espera: 'bg-muted/30 text-muted',
}

export function VerInscritosDialog({ open, onClose, palestraId, palestraNome }: VerInscritosDialogProps) {
  const [inscritos, setInscritos] = useState<Inscrito[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!open) return
    import('@/lib/actions/admin').then(({ listarInscritos }) => {
      listarInscritos(palestraId).then((data) => {
        setInscritos(data)
        setLoading(false)
      }).catch((err) => {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar')
        setLoading(false)
      })
    })
  }, [open, palestraId])

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Inscritos — {palestraNome}</DialogTitle>
        </DialogHeader>

        {erro && (
          <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted" />
          </div>
        ) : inscritos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <Inbox className="size-10 text-muted/40 mb-2" />
            <p className="text-sm text-muted">Nenhum inscrito nesta palestra.</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-card sticky top-0">
                <tr className="text-left text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">Nome</th>
                  <th scope="col" className="px-4 py-3 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium">Telefone</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inscritos.map((i) => (
                  <tr key={i.id} className="bg-background hover:bg-card/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{i.nome}</td>
                    <td className="px-4 py-3 text-muted">{i.email}</td>
                    <td className="px-4 py-3 text-muted">{i.telefone}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[i.status] ?? ''}`}>
                        {statusLabels[i.status] ?? i.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(i.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
