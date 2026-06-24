'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import type { Palestra } from '@/types'
import { adicionarParticipanteSchema } from '@/lib/schemas'
import { toast } from 'sonner'

interface AdicionarParticipanteDialogProps {
  open: boolean
  onClose: () => void
  palestras: Palestra[]
  onAdicionar: (data: { palestra_id: string; nome: string; email: string; telefone: string }) => Promise<void>
}

export function AdicionarParticipanteDialog({ open, onClose, palestras, onAdicionar }: AdicionarParticipanteDialogProps) {
  const uid = useId()
  const [palestraId, setPalestraId] = useState(palestras[0]?.id ?? '')
  const [enviando, setEnviando] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

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
        triggerRef.current?.focus()
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

  function getErrorId(field: string) {
    return `${uid}-${field}-error`
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setEnviando(true)

    const form = new FormData(e.currentTarget)
    const data = {
      palestra_id: palestraId,
      nome: (form.get('nome') as string).trim(),
      email: (form.get('email') as string).trim(),
      telefone: (form.get('telefone') as string).trim(),
    }

    const parsed = adicionarParticipanteSchema.safeParse(data)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string
        if (!errors[field]) errors[field] = issue.message
      }
      setFieldErrors(errors)
      setEnviando(false)
      return
    }

    try {
      await onAdicionar(data)
      toast.success('Participante adicionado com sucesso!')
      e.currentTarget.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar')
    } finally {
      setEnviando(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-md border bg-background px-3 py-2 text-foreground ${fieldErrors[field] ? 'border-danger' : 'border-border'}`

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id={`${uid}-title`} className="text-lg font-bold text-foreground">
            Adicionar Participante
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="text-muted hover:text-foreground transition-colors">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor={`${uid}-palestra`} className="text-sm font-medium text-foreground">
              Palestra <span aria-hidden="true">*</span>
            </label>
            <select
              id={`${uid}-palestra`}
              value={palestraId}
              onChange={(e) => setPalestraId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
            >
              {palestras.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.tema} (Dia {p.dia_evento})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor={`${uid}-nome`} className="text-sm font-medium text-foreground">
              Nome <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${uid}-nome`}
              name="nome"
              type="text"
              autoComplete="name"
              aria-invalid={!!fieldErrors.nome}
              aria-describedby={fieldErrors.nome ? getErrorId('nome') : undefined}
              className={inputClass('nome')}
            />
            {fieldErrors.nome && <p id={getErrorId('nome')} role="alert" className="text-xs text-danger">{fieldErrors.nome}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor={`${uid}-email`} className="text-sm font-medium text-foreground">
              E-mail <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${uid}-email`}
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? getErrorId('email') : undefined}
              className={inputClass('email')}
            />
            {fieldErrors.email && <p id={getErrorId('email')} role="alert" className="text-xs text-danger">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor={`${uid}-telefone`} className="text-sm font-medium text-foreground">
              Telefone <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${uid}-telefone`}
              name="telefone"
              type="tel"
              autoComplete="tel"
              aria-invalid={!!fieldErrors.telefone}
              aria-describedby={fieldErrors.telefone ? getErrorId('telefone') : undefined}
              className={inputClass('telefone')}
            />
            {fieldErrors.telefone && <p id={getErrorId('telefone')} role="alert" className="text-xs text-danger">{fieldErrors.telefone}</p>}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-border min-h-[44px] px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary min-h-[44px] px-4 py-2 text-sm text-primary-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50"
            >
              {enviando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
              {enviando ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
