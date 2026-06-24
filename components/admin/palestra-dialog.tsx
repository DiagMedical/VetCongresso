'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Palestra, PalestraFormData, DiaEvento } from '@/types'

interface PalestraDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: PalestraFormData) => Promise<void>
  palestra?: Palestra | null
}

export function PalestraDialog({ open, onClose, onSave, palestra }: PalestraDialogProps) {
  const uid = useId()
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const editando = !!palestra

  useEffect(() => {
    if (open) {
      const first = dialogRef.current?.querySelector<HTMLElement>('input, select, button')
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
          'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const form = new FormData(e.currentTarget)
    const data: PalestraFormData = {
      dia_evento: Number(form.get('dia_evento')) as DiaEvento,
      tema: form.get('tema') as string,
      palestrante: form.get('palestrante') as string,
      descricao: (form.get('descricao') as string) || undefined,
      horario_inicio: form.get('horario_inicio') as string,
      horario_fim: form.get('horario_fim') as string,
      vagas_totais: Number(form.get('vagas_totais')),
    }

    try {
      await onSave(data)
      onClose()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setEnviando(false)
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
          <h2 id={`${uid}-title`} className="text-lg font-bold text-foreground">
            {editando ? 'Editar Palestra' : 'Nova Palestra'}
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="text-muted hover:text-foreground transition-colors">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {erro && (
          <p role="alert" className="mb-4 rounded-md bg-danger/10 p-3 text-sm text-danger">{erro}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor={`${uid}-tema`} className="text-sm font-medium text-foreground">
              Tema <span aria-hidden="true">*</span>
            </label>
            <input id={`${uid}-tema`} name="tema" type="text" required
              defaultValue={palestra?.tema ?? ''}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
          </div>

          <div className="space-y-2">
            <label htmlFor={`${uid}-palestrante`} className="text-sm font-medium text-foreground">
              Palestrante <span aria-hidden="true">*</span>
            </label>
            <input id={`${uid}-palestrante`} name="palestrante" type="text" required
              defaultValue={palestra?.palestrante ?? ''}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
          </div>

          <div className="space-y-2">
            <label htmlFor={`${uid}-descricao`} className="text-sm font-medium text-foreground">Descrição</label>
            <textarea id={`${uid}-descricao`} name="descricao" rows={3}
              defaultValue={palestra?.descricao ?? ''}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={`${uid}-dia`} className="text-sm font-medium text-foreground">
                Dia <span aria-hidden="true">*</span>
              </label>
              <select id={`${uid}-dia`} name="dia_evento" required
                defaultValue={palestra?.dia_evento ?? 1}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground">
                <option value={1}>Dia 1</option>
                <option value={2}>Dia 2</option>
                <option value={3}>Dia 3</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor={`${uid}-vagas`} className="text-sm font-medium text-foreground">
                Vagas <span aria-hidden="true">*</span>
              </label>
              <input id={`${uid}-vagas`} name="vagas_totais" type="number" min={1} required
                defaultValue={palestra?.vagas_totais ?? 20}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={`${uid}-inicio`} className="text-sm font-medium text-foreground">
                Início <span aria-hidden="true">*</span>
              </label>
              <input id={`${uid}-inicio`} name="horario_inicio" type="datetime-local" required
                defaultValue={palestra?.horario_inicio ? palestra.horario_inicio.slice(0, 16) : ''}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
            </div>

            <div className="space-y-2">
              <label htmlFor={`${uid}-fim`} className="text-sm font-medium text-foreground">
                Fim <span aria-hidden="true">*</span>
              </label>
              <input id={`${uid}-fim`} name="horario_fim" type="datetime-local" required
                defaultValue={palestra?.horario_fim ? palestra.horario_fim.slice(0, 16) : ''}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-md border border-border min-h-[44px] px-4 py-2 text-foreground hover:bg-card transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={enviando}
              className="flex-1 rounded-md bg-primary min-h-[44px] px-4 py-2 text-primary-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50"
              aria-busy={enviando}>
              {enviando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
