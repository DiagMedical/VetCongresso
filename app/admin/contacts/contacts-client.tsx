'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Trash2, Edit3, Inbox, Mail, Phone, Stethoscope, Syringe, Building2, MessageSquare, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPagination } from '@/components/admin/pagination'
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
import { INTERESSES_VET_PADRAO, INTERESSES_HUMANO_PADRAO } from '@/lib/interesses'
import { createContact, updateContact, deleteContact, sendWhatsAppToContact, duplicarLeadsEntreEventos } from '@/lib/actions/crm'
import type { Contact } from '@/types'

interface ContactsClientProps {
  contacts: Contact[]
  totalCount: number
}

type AbaType = 'todos' | 'leads' | 'manuais'

const ORIGENS_LEADS = ['site', 'sorteio']
const ORIGENS_MANUAIS = ['manual', '']

export function ContactsClient({ contacts: initialContacts }: ContactsClientProps) {
  const router = useRouter()
  const [contacts, setContacts] = useState(initialContacts)
  const [aba, setAba] = useState<AbaType>('todos')
  const [busca, setBusca] = useState('')
  const [filtroVendedor, setFiltroVendedor] = useState('')
  const [filtroEmpresa, setFiltroEmpresa] = useState('')
  const [filtroEvento, setFiltroEvento] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Ctrl+K para focar na busca
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="Buscar"]')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  const [whatsappContact, setWhatsappContact] = useState<Contact | null>(null)
  const [whatsappMsg, setWhatsappMsg] = useState('')
  const [whatsappEnviando, setWhatsappEnviando] = useState(false)
  const [showDuplicar, setShowDuplicar] = useState(false)
  const [dupDestino, setDupDestino] = useState('')
  const [dupEmpresa, setDupEmpresa] = useState('')
  const [dupEnviando, setDupEnviando] = useState(false)
  const pageSize = 20

  // Contagens por aba
  const totais = useMemo(() => ({
    todos: contacts.length,
    leads: contacts.filter(c => ORIGENS_LEADS.includes(c.origem)).length,
    manuais: contacts.filter(c => ORIGENS_MANUAIS.includes(c.origem)).length,
  }), [contacts])

  // Filtro (evento + aba + busca + vendedor + empresa)
  const filtrados = useMemo(() => {
    let result = [...contacts]

    if (filtroEvento) {
      result = result.filter(c => c.evento === filtroEvento)
    }

    if (aba === 'leads') {
      result = result.filter(c => ORIGENS_LEADS.includes(c.origem))
    } else if (aba === 'manuais') {
      result = result.filter(c => ORIGENS_MANUAIS.includes(c.origem))
    }

    if (busca) {
      const q = busca.toLowerCase()
      result = result.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        (c.email?.toLowerCase() ?? '').includes(q) ||
        (c.telefone ?? '').includes(q)
      )
    }
    if (filtroVendedor) {
      result = result.filter(c => c.vendedor === filtroVendedor)
    }
    if (filtroEmpresa) {
      result = result.filter(c => c.empresa === filtroEmpresa)
    }
    return result
  }, [contacts, filtroEvento, aba, busca, filtroVendedor, filtroEmpresa])

  const totalPages = Math.ceil(filtrados.length / pageSize)
  const paginados = filtrados.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  async function handleCreate(formData: FormData) {
    try {
      const contact = await createContact({
        nome: formData.get('nome') as string,
        email: formData.get('email') as string,
        telefone: formData.get('telefone') as string,
        origem: 'manual',
        vendedor: formData.get('vendedor') as string,
        observacoes: formData.get('observacoes') as string,
        tags: [],
        interesses_vet: formData.getAll('interesses_vet') as string[],
        interesses_humano: formData.getAll('interesses_humano') as string[],
        empresa: formData.get('empresa') as string,
        evento: formData.get('evento') as string,
      })
      setContacts(prev => [contact, ...prev])
      setShowForm(false)
      toast.success('Lead criado com sucesso!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar lead')
    }
  }

  async function handleUpdate(id: string, formData: FormData) {
    try {
      const updated = await updateContact(id, {
        nome: formData.get('nome') as string,
        email: formData.get('email') as string,
        telefone: formData.get('telefone') as string,
        vendedor: formData.get('vendedor') as string,
        observacoes: formData.get('observacoes') as string,
        tags: [],
        interesses_vet: formData.getAll('interesses_vet') as string[],
        interesses_humano: formData.getAll('interesses_humano') as string[],
        empresa: formData.get('empresa') as string,
        evento: formData.get('evento') as string,
      })
      setContacts(prev => prev.map(c => c.id === id ? updated : c))
      setEditContact(null)
      toast.success('Lead atualizado!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar lead')
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
      toast.success('Lead excluído!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir lead')
    }
  }

  async function handleSendWhatsApp() {
    if (!whatsappContact || !whatsappMsg.trim()) return
    setWhatsappEnviando(true)
    try {
      await sendWhatsAppToContact(whatsappContact.id, whatsappMsg.trim())
      toast.success('WhatsApp enviado com sucesso!')
      setWhatsappContact(null)
      setWhatsappMsg('')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar WhatsApp')
    } finally {
      setWhatsappEnviando(false)
    }
  }

  const vendedoresUnicos = useMemo(() => {
    const set = new Set(contacts.map(c => c.vendedor).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [contacts])

  const eventosUnicos = useMemo(() => {
    const set = new Set(contacts.map(c => c.evento).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [contacts])

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Evento */}
        <select
          value={filtroEvento}
          onChange={e => { setFiltroEvento(e.target.value); setCurrentPage(1) }}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground min-w-[160px]"
          aria-label="Filtrar por evento"
        >
          <option value="">Todos os eventos</option>
          {eventosUnicos.map(ev => (
            <option key={ev} value={ev}>{ev}</option>
          ))}
        </select>

        {/* Tipo */}
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {([{ key: 'todos', label: 'Todos' }, { key: 'leads', label: 'Leads' }, { key: 'manuais', label: 'Manuais' }] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setAba(tab.key); setCurrentPage(1) }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                aba === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-60">({totais[tab.key]})</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Buscar por nome, email ou telefone... (Ctrl+K)"
            value={busca}
            onChange={e => { setBusca(e.target.value); setCurrentPage(1) }}
            className="pl-9"
          />
        </div>
        {vendedoresUnicos.length > 0 && (
          <select
            value={filtroVendedor}
            onChange={e => { setFiltroVendedor(e.target.value); setCurrentPage(1) }}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground"
            aria-label="Filtrar por vendedor"
          >
            <option value="">Todos vendedores</option>
            {vendedoresUnicos.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}
        <select
          value={filtroEmpresa}
          onChange={e => { setFiltroEmpresa(e.target.value); setCurrentPage(1) }}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground"
          aria-label="Filtrar por empresa"
        >
          <option value="">Todas empresas</option>
          <option value="vet">Diagnostic Vet</option>
          <option value="humana">Diagnostic Medical</option>
        </select>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger render={<Button className="gap-2"><Plus className="size-4" />Novo Lead</Button>} />
          <ContactFormDialog
            title="Novo Lead"
            onSubmit={handleCreate}
            onClose={() => setShowForm(false)}
          />
        </Dialog>
        <button
          onClick={() => setShowDuplicar(true)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-muted hover:text-foreground transition-colors"
        >
          🔄 Duplicar
        </button>
      </div>

      {/* Cards Mobile (< md) */}
      <div className="space-y-3 md:hidden">
        {paginados.length === 0 ? (
          <AdminSectionCard>
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Inbox className="size-10 text-muted/40" />
              <p className="text-sm text-muted">
                {busca
                  ? 'Nenhum lead encontrado.'
                  : filtroEvento
                    ? `Nenhum lead para "${filtroEvento}".`
                    : 'Nenhum lead cadastrado.'}
              </p>
            </div>
          </AdminSectionCard>
        ) : (
          paginados.map(contact => (
            <div key={contact.id} className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
              {/* Topo: nome + ações */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{contact.nome}</p>
                  {contact.email && (
                    <p className="text-xs text-muted truncate flex items-center gap-1 mt-0.5">
                      <Mail className="size-3 shrink-0" />
                      {contact.email}
                    </p>
                  )}
                  {contact.telefone && (
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Phone className="size-3 shrink-0" />
                      {contact.telefone}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditContact(contact)} className="rounded-md p-2 text-muted hover:text-foreground transition-colors" aria-label={`Editar ${contact.nome}`}>
                    <Edit3 className="size-4" />
                  </button>
                  {contact.telefone && (
                    <button onClick={() => { setWhatsappContact(contact); setWhatsappMsg('') }} className="rounded-md p-2 text-muted hover:text-green-400 transition-colors" aria-label={`WhatsApp ${contact.nome}`}>
                      <MessageSquare className="size-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(contact.id, contact.nome)} className="rounded-md p-2 text-muted hover:text-red-400 transition-colors" aria-label={`Excluir ${contact.nome}`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Tags: badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {contact.empresa && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    contact.empresa === 'vet' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                  }`}>
                    {contact.empresa === 'vet' ? 'Diagnostic Vet' : 'Diagnostic Medical'}
                  </span>
                )}
                <span className="rounded-full bg-border/50 px-2 py-0.5 text-[10px] text-muted">
                  {contact.origem || 'manual'}
                </span>
                {contact.vendedor && (
                  <span className="rounded-full bg-border/50 px-2 py-0.5 text-[10px] text-muted">
                    {contact.vendedor}
                  </span>
                )}
              </div>

              {/* Evento + Data */}
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{contact.evento || 'Sem evento'}</span>
                <span>{formatDate(contact.created_at)}</span>
              </div>

              {/* Interesses */}
              {[...(contact.interesses_vet ?? []), ...(contact.interesses_humano ?? [])].length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(contact.interesses_vet ?? []).map(i => (
                    <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium truncate max-w-[130px]">{i}</span>
                  ))}
                  {(contact.interesses_humano ?? []).map(i => (
                    <span key={i} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent font-medium truncate max-w-[130px]">{i}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Tabela (md+) */}
      <div className="hidden md:block">
      <AdminSectionCard>
        {paginados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Inbox className="size-12 text-muted/40" />
            <p className="text-sm text-muted">
              {busca
                ? 'Nenhum lead encontrado para esta busca.'
                : filtroEvento
                  ? `Nenhum lead encontrado para o evento "${filtroEvento}".`
                  : aba === 'leads'
                    ? 'Nenhum lead encontrado. Leads vêm do site ou sorteio.'
                    : aba === 'manuais'
                      ? 'Nenhum lead manual. Crie um novo lead com o botão acima.'
                      : 'Nenhum lead cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left font-medium text-muted">Nome</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden sm:table-cell">Email</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden md:table-cell">Telefone</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden lg:table-cell">Vendedor</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden lg:table-cell">Empresa</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden xl:table-cell">Evento</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden lg:table-cell">Origem</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden xl:table-cell">Interesses</th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted">Data</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginados.map(contact => (
                  <tr key={contact.id} className="border-b border-border hover:ring-1 hover:ring-accent/10 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-foreground truncate max-w-[180px]">
                      {contact.nome}
                    </td>
                    <td className="px-3 py-2.5 text-muted truncate max-w-[200px] hidden sm:table-cell">
                      {contact.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3 shrink-0" />
                          {contact.email}
                        </span>
                      ) : <span className="text-muted/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-muted hidden md:table-cell">
                      {contact.telefone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3 shrink-0" />
                          {contact.telefone}
                        </span>
                      ) : <span className="text-muted/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-muted truncate max-w-[100px] hidden lg:table-cell">
                      {contact.vendedor || <span className="text-muted/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5 truncate max-w-[100px] hidden lg:table-cell">
                      {contact.empresa ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          contact.empresa === 'vet'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent'
                        }`}>
                          {contact.empresa === 'vet' ? 'Vet' : 'Humana'}
                        </span>
                      ) : <span className="text-muted/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-muted truncate max-w-[140px] hidden xl:table-cell">
                      {contact.evento || <span className="text-muted/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-muted hidden lg:table-cell">
                      {contact.origem || <span className="text-muted/40">—</span>}
                    </td>
                    <td className="px-3 py-2.5 hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {[...(contact.interesses_vet ?? []), ...(contact.interesses_humano ?? [])].length === 0 ? (
                          <span className="text-muted/40">—</span>
                        ) : (
                          <>
                            {(contact.interesses_vet ?? []).slice(0, 2).map(i => (
                              <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium truncate max-w-[120px]">{i}</span>
                            ))}
                            {(contact.interesses_humano ?? []).slice(0, 1).map(i => (
                              <span key={i} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent font-medium truncate max-w-[120px]">{i}</span>
                            ))}
                            {[...(contact.interesses_vet ?? []), ...(contact.interesses_humano ?? [])].length > 3 && (
                              <span className="text-[10px] text-muted">+{[...(contact.interesses_vet ?? []), ...(contact.interesses_humano ?? [])].length - 3}</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted whitespace-nowrap">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditContact(contact)}
                          className="rounded-md p-2 text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                          aria-label={`Editar ${contact.nome}`}
                          title={`Editar ${contact.nome}`}
                        >
                          <Edit3 className="size-4" />
                        </button>
                        {contact.telefone && (
                          <button
                            onClick={() => { setWhatsappContact(contact); setWhatsappMsg('') }}
                            className="rounded-md p-2 text-muted hover:text-green-400 hover:bg-green-500/10 transition-colors"
                            aria-label={`WhatsApp ${contact.nome}`}
                            title={`Enviar WhatsApp para ${contact.nome}`}
                          >
                            <MessageSquare className="size-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(contact.id, contact.nome)}
                          className="rounded-md p-2 text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label={`Excluir ${contact.nome}`}
                          title={`Excluir ${contact.nome}`}
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

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtrados.length}
        pageSize={pageSize}
        label="leads"
      />
      </div>

      {/* Dialog de edição */}
      <Dialog open={!!editContact} onOpenChange={open => { if (!open) setEditContact(null) }}>
        {editContact && (
          <ContactFormDialog
            title="Editar Lead"
            contact={editContact}
            onSubmit={(formData) => handleUpdate(editContact.id, formData)}
            onClose={() => setEditContact(null)}
          />
        )}
      </Dialog>

      {/* WhatsApp Dialog */}
      <Dialog open={!!whatsappContact} onOpenChange={open => { if (!open) { setWhatsappContact(null); setWhatsappMsg('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar WhatsApp</DialogTitle>
            <DialogDescription>
              {whatsappContact ? `Enviar mensagem para ${whatsappContact.nome} (${whatsappContact.telefone})` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={whatsappMsg}
              onChange={e => setWhatsappMsg(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
              placeholder="Digite sua mensagem..."
            />
            <div className="flex items-center justify-end gap-3">
              <DialogClose onClick={() => { setWhatsappContact(null); setWhatsappMsg('') }} type="button" className="rounded-md px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
                Cancelar
              </DialogClose>
              <Button onClick={handleSendWhatsApp} disabled={!whatsappMsg.trim() || whatsappEnviando} className="gap-2">
                {whatsappEnviando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {whatsappEnviando ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicar Leads */}
      <Dialog open={showDuplicar} onOpenChange={open => { if (!open) { setShowDuplicar(false); setDupDestino(''); setDupEmpresa('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicar Leads</DialogTitle>
            <DialogDescription>Copie leads de um evento para outro.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Evento de origem</label>
              <select
                value={filtroEvento || ''}
                onChange={e => setFiltroEvento(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Selecione um evento</option>
                {eventosUnicos.map(ev => <option key={ev} value={ev}>{ev}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Novo evento (destino)</label>
              <Input value={dupDestino} onChange={e => setDupDestino(e.target.value)} placeholder="Ex: Congresso Médico 2026" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Empresa (opcional)</label>
              <select value={dupEmpresa} onChange={e => setDupEmpresa(e.target.value)} className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                <option value="">Todas</option>
                <option value="vet">Diagnostic Vet</option>
                <option value="humana">Diagnostic Medical</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <DialogClose type="button" className="rounded-md px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
                Cancelar
              </DialogClose>
              <Button onClick={async () => {
                if (!filtroEvento || !dupDestino) { toast.error('Preencha origem e destino'); return }
                setDupEnviando(true)
                try {
                  const res = await duplicarLeadsEntreEventos(filtroEvento, dupDestino, dupEmpresa || undefined)
                  toast.success(`${res.total} leads duplicados para "${dupDestino}"!`)
                  setShowDuplicar(false)
                  router.refresh()
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Erro ao duplicar')
                } finally {
                  setDupEnviando(false)
                }
              }} disabled={dupEnviando} className="gap-2">
                {dupEnviando ? <Loader2 className="size-4 animate-spin" /> : null}
                {dupEnviando ? 'Duplicando...' : 'Duplicar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================
// Contact Form Dialog
// ============================================================

function ContactFormDialog({
  title,
  contact,
  onSubmit,
  onClose,
}: {
  title: string
  contact?: Contact
  onSubmit: (data: FormData) => Promise<void>
  onClose: () => void
}) {
  const [selVet, setSelVet] = useState<string[]>(contact?.interesses_vet ?? [])
  const [selHumano, setSelHumano] = useState<string[]>(contact?.interesses_humano ?? [])
  const [empresa, setEmpresa] = useState(contact?.empresa ?? '')

  function toggleVet(item: string) {
    setSelVet(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  function toggleHumano(item: string) {
    setSelHumano(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  async function handleSubmit(formData: FormData) {
    selVet.forEach(item => formData.append('interesses_vet', item))
    selHumano.forEach(item => formData.append('interesses_humano', item))
    await onSubmit(formData)
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Preencha os dados do lead.</DialogDescription>
      </DialogHeader>
      <form action={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
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

        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-foreground">Nome *</label>
          <Input id="nome" name="nome" defaultValue={contact?.nome ?? ''} required minLength={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ''} />
          </div>
          <div className="space-y-2">
            <label htmlFor="telefone" className="text-sm font-medium text-foreground">Telefone</label>
            <Input id="telefone" name="telefone" defaultValue={contact?.telefone ?? ''} />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="vendedor" className="text-sm font-medium text-foreground">Vendedor</label>
          <Input id="vendedor" name="vendedor" defaultValue={contact?.vendedor ?? ''} />
        </div>
        <div className="space-y-2">
          <label htmlFor="evento" className="text-sm font-medium text-foreground">Evento</label>
          <Input id="evento" name="evento" defaultValue={contact?.evento ?? ''} placeholder="Ex: ABRAVEQ 2026, Congresso Médico..." />
        </div>

        {/* Interesses conforme empresa selecionada */}
        {empresa === 'vet' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="size-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Interesses — Veterinária</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESSES_VET_PADRAO.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleVet(item)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    selVet.includes(item)
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border text-muted hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {empresa === 'humana' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Syringe className="size-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Interesses — Humana</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESSES_HUMANO_PADRAO.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleHumano(item)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    selHumano.includes(item)
                      ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                      : 'border-border text-muted hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="observacoes" className="text-sm font-medium text-foreground">Observações</label>
          <textarea
            id="observacoes"
            name="observacoes"
            defaultValue={contact?.observacoes ?? ''}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <DialogClose onClick={onClose} type="button" className="rounded-md px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
            Cancelar
          </DialogClose>
          <Button type="submit">
            {contact ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
