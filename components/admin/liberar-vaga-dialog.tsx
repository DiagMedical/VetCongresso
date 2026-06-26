'use client'

import { useState } from 'react'
import { UserX, Loader2 } from 'lucide-react'
import type { Inscrito } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LiberarVagaDialogProps {
  open: boolean
  onClose: () => void
  inscritos: Inscrito[]
  onCancelar: (id: string) => Promise<void>
}

export function LiberarVagaDialog({ open, onClose, inscritos, onCancelar }: LiberarVagaDialogProps) {
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  const confirmados = inscritos.filter((i) => i.status === 'confirmado')

  async function handleCancelar(id: string) {
    setCancelando(id)
    setErro('')
    try {
      await onCancelar(id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cancelar')
    } finally {
      setCancelando(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Liberar Vaga</DialogTitle>
        </DialogHeader>

        {erro && (
          <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>
        )}

        {confirmados.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            Nenhum participante confirmado para liberar vaga.
          </p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-auto" role="list">
            {confirmados.map((i) => (
              <div key={i.id} role="listitem" className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{i.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{i.email}</p>
                </div>
                <Button
                  onClick={() => handleCancelar(i.id)}
                  disabled={cancelando === i.id}
                  variant="destructive"
                  size="xs"
                  aria-label={`Cancelar reserva de ${i.nome}`}
                >
                  {cancelando === i.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <UserX className="size-3.5" />
                  )}
                  Cancelar
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
