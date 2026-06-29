'use client'

import { useState } from 'react'
import type { Palestra, PalestraFormData, DiaEvento } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PalestraDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: PalestraFormData) => Promise<void>
  palestra?: Palestra | null
}

export function PalestraDialog({ open, onClose, onSave, palestra }: PalestraDialogProps) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const editando = !!palestra

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
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar Palestra' : 'Nova Palestra'}</DialogTitle>
        </DialogHeader>

        {erro && (
          <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="tema" className="text-sm font-medium text-foreground">
              Tema <span aria-hidden="true">*</span>
            </label>
            <input id="tema" name="tema" type="text" required
              defaultValue={palestra?.tema ?? ''}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
          </div>

          <div className="space-y-2">
            <label htmlFor="palestrante" className="text-sm font-medium text-foreground">
              Palestrante <span aria-hidden="true">*</span>
            </label>
            <input id="palestrante" name="palestrante" type="text" required
              defaultValue={palestra?.palestrante ?? ''}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
          </div>

          <div className="space-y-2">
            <label htmlFor="descricao" className="text-sm font-medium text-foreground">Descrição</label>
            <textarea id="descricao" name="descricao" rows={3}
              defaultValue={palestra?.descricao ?? ''}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="dia_evento" className="text-sm font-medium text-foreground">
                Dia <span aria-hidden="true">*</span>
              </label>
              <select id="dia_evento" name="dia_evento" required
                defaultValue={palestra?.dia_evento ?? 1}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground">
                <option value={1}>Dia 1</option>
                <option value={2}>Dia 2</option>
                <option value={3}>Dia 3</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="vagas_totais" className="text-sm font-medium text-foreground">
                Vagas <span aria-hidden="true">*</span>
              </label>
              <input id="vagas_totais" name="vagas_totais" type="number" min={1} required
                defaultValue={palestra?.vagas_totais ?? 20}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="horario_inicio" className="text-sm font-medium text-foreground">
                Início <span aria-hidden="true">*</span>
              </label>
              <input id="horario_inicio" name="horario_inicio" type="datetime-local" required
                defaultValue={palestra?.horario_inicio ? palestra.horario_inicio.slice(0, 16) : ''}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
            </div>

            <div className="space-y-2">
              <label htmlFor="horario_fim" className="text-sm font-medium text-foreground">
                Fim <span aria-hidden="true">*</span>
              </label>
              <input id="horario_fim" name="horario_fim" type="datetime-local" required
                defaultValue={palestra?.horario_fim ? palestra.horario_fim.slice(0, 16) : ''}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando} className="flex-1" aria-busy={enviando}>
              {enviando && <Loader2 className="size-4 animate-spin" />}
              {enviando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
