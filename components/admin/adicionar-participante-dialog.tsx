'use client'

import { useState, useId } from 'react'
import { Loader2 } from 'lucide-react'
import type { Palestra } from '@/types'
import { adicionarParticipanteSchema } from '@/lib/schemas'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AdicionarParticipanteDialogProps {
  open: boolean
  onClose: () => void
  palestras: Palestra[]
  vendedores?: string[]
  onAdicionar: (data: { palestra_id: string; nome: string; email: string; telefone: string; vendedor?: string }) => Promise<void>
}

export function AdicionarParticipanteDialog({ open, onClose, palestras, vendedores = [], onAdicionar }: AdicionarParticipanteDialogProps) {
  const uid = useId()
  const [palestraId, setPalestraId] = useState(palestras[0]?.id ?? '')
  const [enviando, setEnviando] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [vendedor, setVendedor] = useState('')

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
      await onAdicionar({ ...data, vendedor: vendedor || undefined })
      toast.success('Participante adicionado com sucesso!')
      e.currentTarget.reset()
      setVendedor('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar')
    } finally {
      setEnviando(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-md border bg-background px-3 py-2 text-foreground ${fieldErrors[field] ? 'border-destructive' : 'border-border'}`

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Adicionar Participante</DialogTitle>
        </DialogHeader>

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
            {fieldErrors.nome && <p id={getErrorId('nome')} role="alert" className="text-xs text-destructive">{fieldErrors.nome}</p>}
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
            {fieldErrors.email && <p id={getErrorId('email')} role="alert" className="text-xs text-destructive">{fieldErrors.email}</p>}
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
            {fieldErrors.telefone && <p id={getErrorId('telefone')} role="alert" className="text-xs text-destructive">{fieldErrors.telefone}</p>}
          </div>

          {vendedores.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {vendedores.map((nome) => (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => setVendedor(vendedor === nome ? '' : nome)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      vendedor === nome
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-card text-muted ring-1 ring-border hover:ring-primary/40'
                    }`}
                  >
                    {nome}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando} className="flex-1">
              {enviando && <Loader2 className="size-4 animate-spin" />}
              {enviando ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
