'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Kanban, Table2, Trash2, Edit3, DollarSign, User } from 'lucide-react'
import { toast } from 'sonner'
import { AdminSectionCard } from '@/components/admin/section-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { createDeal, updateDeal, deleteDeal, moveDealStage } from '@/lib/actions/crm'
import type { Deal, PipelineStage } from '@/types'
import { listarContacts } from '@/lib/actions/crm'

interface DealsKanbanProps {
  deals: Deal[]
  stages: PipelineStage[]
}

export function DealsKanban({ deals: initialDeals, stages }: DealsKanbanProps) {
  const router = useRouter()
  const [deals, setDeals] = useState(initialDeals)
  const [visao, setVisao] = useState<'kanban' | 'tabela'>('kanban')
  const [dragDealId, setDragDealId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editDeal, setEditDeal] = useState<Deal | null>(null)
  const [contacts, setContacts] = useState<{ id: string; nome: string }[]>([])

  // Agrupar deals por stage
  const dealsPorStage = stages.map(stage => ({
    stage,
    deals: deals.filter(d => d.stage_id === stage.id),
  }))

  const valorTotalPipeline = deals.reduce((acc, d) => acc + Number(d.valor ?? 0), 0)

  // Carregar contatos para o formulário
  async function loadContacts() {
    if (contacts.length > 0) return
    try {
      const { data } = await listarContacts({ pageSize: 500 })
      setContacts(data.map(c => ({ id: c.id, nome: c.nome })))
    } catch {
      // Silencia
    }
  }

  async function handleCreate(formData: FormData) {
    try {
      const deal = await createDeal({
        titulo: formData.get('titulo') as string,
        contact_id: formData.get('contact_id') as string,
        valor: Number(formData.get('valor')) || 0,
        stage_id: formData.get('stage_id') as string,
        vendedor: formData.get('vendedor') as string,
        descricao: formData.get('descricao') as string,
      })
      setDeals(prev => [deal, ...prev])
      setShowForm(false)
      toast.success('Deal criado!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar deal')
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    try {
      const updated = await updateDeal(id, {
        titulo: formData.get('titulo') as string,
        contact_id: formData.get('contact_id') as string,
        valor: Number(formData.get('valor')) || 0,
        stage_id: formData.get('stage_id') as string,
        vendedor: formData.get('vendedor') as string,
        descricao: formData.get('descricao') as string,
      })
      setDeals(prev => prev.map(d => d.id === id ? updated : d))
      setEditDeal(null)
      toast.success('Deal atualizado!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar deal')
    }
  }

  async function handleMoveToStage(dealId: string, stageId: string) {
    try {
      const updated = await moveDealStage(dealId, stageId)
      setDeals(prev => prev.map(d => d.id === dealId ? updated : d))
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao mover deal')
    }
  }

  async function handleDelete(id: string, titulo: string) {
    if (!window.confirm(`Excluir "${titulo}"?`)) return
    try {
      await deleteDeal(id)
      setDeals(prev => prev.filter(d => d.id !== id))
      toast.success('Deal excluído!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir deal')
    }
  }

  const handleDragStart = useCallback((dealId: string) => {
    setDragDealId(dealId)
  }, [])

  const handleDrop = async (stageId: string) => {
    if (dragDealId) {
      await handleMoveToStage(dragDealId, stageId)
      setDragDealId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-border bg-card px-3 py-1.5">
            <span className="text-sm text-muted">Pipeline: </span>
            <span className="text-sm font-semibold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalPipeline)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setVisao('kanban')}
              className={`px-3 py-2 text-sm transition-colors ${visao === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground'}`}
              aria-label="Visão Kanban"
            >
              <Kanban className="size-4" />
            </button>
            <button
              onClick={() => setVisao('tabela')}
              className={`px-3 py-2 text-sm transition-colors ${visao === 'tabela' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground'}`}
              aria-label="Visão Tabela"
            >
              <Table2 className="size-4" />
            </button>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger render={<Button className="gap-2" onClick={loadContacts}><Plus className="size-4" />Novo Deal</Button>} />
            <DealFormDialog
              title="Novo Deal"
              stages={stages}
              contacts={contacts}
              onSubmit={handleCreate}
              onClose={() => setShowForm(false)}
            />
          </Dialog>
        </div>
      </div>

      {visao === 'kanban' ? (
        /* ========== VISÃO KANBAN ========== */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {dealsPorStage.map(({ stage, deals: stageDeals }) => (
            <div
              key={stage.id}
              className="flex flex-col rounded-2xl border border-border bg-card/30 backdrop-blur-sm"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: stage.cor }} />
                  <span className="text-sm font-semibold text-foreground">{stage.nome}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">{stageDeals.length}</Badge>
                </div>
                <span className="text-xs text-muted">{stage.probabilidade}%</span>
              </div>
              <div className="flex flex-col gap-2 p-3 min-h-[200px]">
                {stageDeals.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-8">
                    <p className="text-xs text-muted/50">Arraste deals para cá</p>
                  </div>
                )}
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                    className="group cursor-grab active:cursor-grabbing rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{deal.titulo}</p>
                        {deal.contact && (
                          <p className="mt-1 text-xs text-muted flex items-center gap-1">
                            <User className="size-3 shrink-0" />
                            <span className="truncate">{deal.contact.nome}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditDeal(deal); loadContacts() }}
                          className="rounded-md p-1 text-muted hover:text-foreground transition-colors"
                          aria-label={`Editar ${deal.titulo}`}
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id, deal.titulo)}
                          className="rounded-md p-1 text-muted hover:text-red-400 transition-colors"
                          aria-label={`Excluir ${deal.titulo}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    {deal.valor > 0 && (
                      <p className="mt-2 text-xs font-semibold text-foreground flex items-center gap-1">
                        <DollarSign className="size-3" />
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deal.valor))}
                      </p>
                    )}
                    <div className="mt-2">
                      <select
                        value={deal.stage_id}
                        onChange={e => handleMoveToStage(deal.id, e.target.value)}
                        className="w-full rounded-md border border-border/50 bg-background px-2 py-1 text-xs text-muted"
                        aria-label="Mover para estágio"
                      >
                        {stages.map(s => (
                          <option key={s.id} value={s.id}>{s.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ========== VISÃO TABELA ========== */
        <AdminSectionCard>
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left font-medium text-muted">Título</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden sm:table-cell">Contato</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted">Estágio</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden md:table-cell">Valor</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden lg:table-cell">Vendedor</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted">Data</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted">Ações</th>
                </tr>
              </thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal.id} className="border-b border-border hover:ring-1 hover:ring-accent/10 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-foreground truncate max-w-[200px]">{deal.titulo}</td>
                    <td className="px-3 py-2.5 text-muted truncate max-w-[150px] hidden sm:table-cell">
                      {deal.contact?.nome ?? <span className="text-muted/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={deal.stage_id}
                        onChange={e => handleMoveToStage(deal.id, e.target.value)}
                        className="rounded-md border border-border/50 bg-background px-2 py-1 text-xs text-muted max-w-[130px]"
                        aria-label="Mover estágio"
                      >
                        {stages.map(s => (
                          <option key={s.id} value={s.id}>{s.nome}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-foreground font-medium hidden md:table-cell">
                      {deal.valor > 0
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deal.valor))
                        : <span className="text-muted/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-muted hidden lg:table-cell">{deal.vendedor || <span className="text-muted/40">—</span>}</td>
                    <td className="px-3 py-2.5 text-muted whitespace-nowrap">{formatDate(deal.created_at)}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditDeal(deal); loadContacts() }}
                          className="rounded-md p-2 text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                          aria-label={`Editar ${deal.titulo}`}
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id, deal.titulo)}
                          className="rounded-md p-2 text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label={`Excluir ${deal.titulo}`}
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
        </AdminSectionCard>
      )}

      {/* Dialog de edição */}
      <Dialog open={!!editDeal} onOpenChange={open => { if (!open) setEditDeal(null) }}>
        {editDeal && (
          <DealFormDialog
            title="Editar Deal"
            stages={stages}
            contacts={contacts}
            deal={editDeal}
            onSubmit={(formData) => handleUpdate(editDeal.id, formData)}
            onClose={() => setEditDeal(null)}
          />
        )}
      </Dialog>
    </div>
  )
}

// ============================================================
// Deal Form Dialog
// ============================================================

function DealFormDialog({
  title,
  stages,
  contacts,
  deal,
  onSubmit,
  onClose,
}: {
  title: string
  stages: PipelineStage[]
  contacts: { id: string; nome: string }[]
  deal?: Deal
  onSubmit: (data: FormData) => Promise<void>
  onClose: () => void
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Preencha os dados do deal.</DialogDescription>
      </DialogHeader>
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="titulo" className="text-sm font-medium text-foreground">Título *</label>
          <Input id="titulo" name="titulo" defaultValue={deal?.titulo ?? ''} required minLength={3} />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact_id" className="text-sm font-medium text-foreground">Contato</label>
          <select
            id="contact_id"
            name="contact_id"
            defaultValue={deal?.contact_id ?? ''}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="">Selecione um contato</option>
            {contacts.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="valor" className="text-sm font-medium text-foreground">Valor</label>
            <Input id="valor" name="valor" type="number" step="0.01" min="0" defaultValue={deal?.valor ?? ''} />
          </div>
          <div className="space-y-2">
            <label htmlFor="stage_id" className="text-sm font-medium text-foreground">Estágio *</label>
            <select
              id="stage_id"
              name="stage_id"
              defaultValue={deal?.stage_id ?? stages[0]?.id ?? ''}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              required
            >
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="vendedor" className="text-sm font-medium text-foreground">Vendedor</label>
          <Input id="vendedor" name="vendedor" defaultValue={deal?.vendedor ?? ''} />
        </div>
        <div className="space-y-2">
          <label htmlFor="descricao" className="text-sm font-medium text-foreground">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            defaultValue={deal?.descricao ?? ''}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <DialogClose onClick={onClose} type="button" className="rounded-md px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
            Cancelar
          </DialogClose>
          <Button type="submit">{deal ? 'Salvar' : 'Criar'}</Button>
        </div>
      </form>
    </DialogContent>
  )
}
