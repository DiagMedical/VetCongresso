'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit3, Building2, CalendarRange, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminSectionCard } from '@/components/admin/section-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { criarEvento, atualizarEvento, excluirEvento } from '@/lib/actions/crm'
import type { Evento } from '@/types'

interface EventosClientProps {
  eventos: (Evento & { total_contacts: number })[]
}

export function EventosClient({ eventos: initialEventos }: EventosClientProps) {
  const router = useRouter()
  const [eventos, setEventos] = useState(initialEventos)
  const [showForm, setShowForm] = useState(false)
  const [editEvento, setEditEvento] = useState<Evento | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(formData: FormData) {
    setEnviando(true)
    try {
      const nome = formData.get('nome') as string
      const empresa = formData.get('empresa') as 'vet' | 'humana'

      if (!nome || nome.trim().length < 3) {
        toast.error('Nome deve ter no mínimo 3 caracteres')
        return
      }

      if (editEvento) {
        const updated = await atualizarEvento(editEvento.id, {
          nome: nome.trim(),
          empresa,
          ativo: editEvento.ativo,
        })
        setEventos(prev => prev.map(e => e.id === editEvento.id ? { ...updated, total_contacts: e.total_contacts } : e))
        setEditEvento(null)
        toast.success('Evento atualizado!')
      } else {
        const created = await criarEvento({ nome: nome.trim(), empresa, ativo: true })
        setEventos(prev => [...prev, { ...created, total_contacts: 0 }])
        setShowForm(false)
        toast.success('Evento criado!')
      }
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar evento')
    } finally {
      setEnviando(false)
    }
  }

  async function handleToggleAtivo(evento: Evento) {
    try {
      const updated = await atualizarEvento(evento.id, { ativo: !evento.ativo })
      setEventos(prev => prev.map(e => e.id === evento.id ? { ...updated, total_contacts: e.total_contacts } : e))
      toast.success(updated.ativo ? 'Evento ativado!' : 'Evento desativado!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao alterar status')
    }
  }

  async function handleDelete(evento: Evento & { total_contacts?: number }) {
    const msg = (evento.total_contacts ?? 0) > 0
      ? `Excluir "${evento.nome}"? ${evento.total_contacts} lead(s) estão vinculados a este evento (o texto do evento permanece nos leads).`
      : `Excluir "${evento.nome}"?`
    if (!window.confirm(msg)) return
    try {
      await excluirEvento(evento.id)
      setEventos(prev => prev.filter(e => e.id !== evento.id))
      toast.success('Evento excluído!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir evento')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header + Novo */}
      <div className="flex items-center justify-between">
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger render={<Button className="gap-2"><Plus className="size-4" />Novo Evento</Button>} />
          <EventoFormDialog
            title="Novo Evento"
            onSubmit={handleSubmit}
            onClose={() => setShowForm(false)}
            enviando={enviando}
          />
        </Dialog>
      </div>

      {/* Lista */}
      <AdminSectionCard>
        {eventos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <CalendarRange className="size-12 text-muted/40" />
            <p className="text-sm text-muted">Nenhum evento cadastrado. Crie o primeiro evento com o botão acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Empresa</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Ativo</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Leads</th>
                  <th className="px-4 py-3 text-left font-medium text-muted hidden md:table-cell">Criado em</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Ações</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map(evento => (
                  <tr key={evento.id} className="border-b border-border hover:ring-1 hover:ring-accent/10 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarRange className="size-4 text-muted shrink-0" />
                        {evento.nome}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        evento.empresa === 'vet'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent/10 text-accent'
                      }`}>
                        {evento.empresa === 'vet' ? 'Diagnostic Vet' : 'Diagnostic Medical'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleAtivo(evento)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          evento.ativo
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            : 'bg-border text-muted hover:text-foreground'
                        }`}
                        aria-label={evento.ativo ? 'Desativar evento' : 'Ativar evento'}
                      >
                        <span className={`size-1.5 rounded-full ${evento.ativo ? 'bg-green-400' : 'bg-muted'}`} />
                        {evento.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-border/50 px-2 py-0.5 text-xs text-muted">
                        {evento.total_contacts}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">
                      {formatDate(evento.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditEvento(evento)}
                          className="rounded-md p-2 text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                          aria-label={`Editar ${evento.nome}`}
                          title={`Editar ${evento.nome}`}
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(evento)}
                          className="rounded-md p-2 text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label={`Excluir ${evento.nome}`}
                          title={`Excluir ${evento.nome}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>

      {/* Dialog de edição */}
      <Dialog open={!!editEvento} onOpenChange={open => { if (!open) setEditEvento(null) }}>
        {editEvento && (
          <EventoFormDialog
            title="Editar Evento"
            evento={editEvento}
            onSubmit={handleSubmit}
            onClose={() => setEditEvento(null)}
            enviando={enviando}
          />
        )}
      </Dialog>
    </div>
  )
}

// ============================================================
// Evento Form Dialog
// ============================================================

function EventoFormDialog({
  title,
  evento,
  onSubmit,
  onClose,
  enviando,
}: {
  title: string
  evento?: Evento
  onSubmit: (data: FormData) => Promise<void>
  onClose: () => void
  enviando: boolean
}) {
  const [empresa, setEmpresa] = useState(evento?.empresa ?? '')

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Preencha os dados do evento.</DialogDescription>
      </DialogHeader>
      <form onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set('empresa', empresa)
        await onSubmit(formData)
      }} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-foreground">Nome do Evento *</label>
          <Input id="nome" name="nome" defaultValue={evento?.nome ?? ''} required minLength={3} placeholder="Ex: ABRAVEQ 2026" />
        </div>

        {/* Empresa (toggle) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Empresa *</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEmpresa('vet')}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                empresa === 'vet'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted hover:border-foreground/30'
              }`}
            >
              <Building2 className="size-4 mb-1 mx-auto" />
              Diagnostic Vet
            </button>
            <button
              type="button"
              onClick={() => setEmpresa('humana')}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                empresa === 'humana'
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-foreground/30'
              }`}
            >
              <Building2 className="size-4 mb-1 mx-auto" />
              Diagnostic Medical
            </button>
          </div>
          <input type="hidden" name="empresa" value={empresa} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <DialogClose type="button" className="rounded-md px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
            Cancelar
          </DialogClose>
          <Button type="submit" disabled={!empresa || enviando} className="gap-2">
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            {enviando ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
