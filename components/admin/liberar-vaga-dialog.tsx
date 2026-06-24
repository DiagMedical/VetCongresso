'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { X, UserX, Loader2 } from 'lucide-react'
import type { Inscrito } from '@/types'

interface LiberarVagaDialogProps {
  open: boolean
  onClose: () => void
  inscritos: Inscrito[]
  onCancelar: (id: string) => Promise<void>
}

export function LiberarVagaDialog({ open, onClose, inscritos, onCancelar }: LiberarVagaDialogProps) {
  const uid = useId()
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      const first = dialogRef.current?.querySelector<HTMLElement>('button')
      first?.focus()
    }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose()
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

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
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id={`${uid}-title`} className="text-lg font-bold text-foreground">Liberar Vaga</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-muted hover:text-foreground transition-colors">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {erro && (
          <p role="alert" className="mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger">{erro}</p>
        )}

        {confirmados.length === 0 ? (
          <p className="text-muted text-sm py-8 text-center">
            Nenhum participante confirmado para liberar vaga.
          </p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-auto" role="list">
            {confirmados.map((i) => (
              <div key={i.id} role="listitem" className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{i.nome}</p>
                  <p className="text-xs text-muted truncate">{i.email}</p>
                </div>
                <button
                  onClick={() => handleCancelar(i.id)}
                  disabled={cancelando === i.id}
                  className="ml-2 flex shrink-0 items-center gap-1 rounded-md bg-danger/10 min-h-[44px] px-3 py-1.5 text-xs text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                  aria-label={`Cancelar reserva de ${i.nome}`}
                >
                  {cancelando === i.id ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <UserX className="size-3.5" aria-hidden="true" />
                  )}
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
