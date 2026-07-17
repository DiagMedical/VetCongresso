'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Trash2, Edit3, Inbox, Mail, Phone } from 'lucide-react'
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
import { createContact, updateContact, deleteContact } from '@/lib/actions/crm'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [showForm, setShowForm] = useState(false)
  const pageSize = 20

  // Contagens por aba
  const totais = useMemo(() => ({
    todos: contacts.length,
    leads: contacts.filter(c => ORIGENS_LEADS.includes(c.origem)).length,
    manuais: contacts.filter(c => ORIGENS_MANUAIS.includes(c.origem)).length,
  }), [contacts])

  // Filtro (aba + busca + vendedor)
  const filtrados = useMemo(() => {
    let result = [...contacts]

    // Filtro por aba
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
    return result
  }, [contacts, aba, busca, filtroVendedor])

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
      })
      setContacts(prev => [contact, ...prev])
      setShowForm(false)
      toast.success('Contato criado com sucesso!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar contato')
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
      })
      setContacts(prev => prev.map(c => c.id === id ? updated : c))
      setEditContact(null)
      toast.success('Contato atualizado!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar contato')
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!window.confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteContact(id)
      setContacts(prev => prev.filter(c => c.id !== id))
      toast.success('Contato excluído!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir contato')
    }
  }

  const vendedoresUnicos = useMemo(() => {
    const set = new Set(contacts.map(c => c.vendedor).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [contacts])

  return (
    <div className="space-y-4">
      {/* Abas: Todos / Leads / Manuais */}
      <div className="flex gap-1 rounded-lg border border-border p-1 w-fit">
        {([{ key: 'todos', label: 'Todos' }, { key: 'leads', label: 'Leads' }, { key: 'manuais', label: 'Manuais' }] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setAba(tab.key); setCurrentPage(1) }}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
              aba === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-60">({totais[tab.key]})</span>
          </button>
        ))}
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
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
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger render={<Button className="gap-2"><Plus className="size-4" />Novo Contato</Button>} />
          <ContactFormDialog
            title="Novo Contato"
            onSubmit={handleCreate}
            onClose={() => setShowForm(false)}
          />
        </Dialog>
      </div>

      {/* Tabela */}
      <AdminSectionCard>
        {paginados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Inbox className="size-12 text-muted/40" />
            <p className="text-sm text-muted">
              {busca
                ? 'Nenhum contato encontrado para esta busca.'
                : aba === 'leads'
                  ? 'Nenhum lead encontrado. Leads vêm do site ou sorteio.'
                  : aba === 'manuais'
                    ? 'Nenhum contato manual. Crie um novo contato com o botão acima.'
                    : 'Nenhum contato cadastrado.'}
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
                  <th className="px-3 py-2.5 text-left font-medium text-muted hidden lg:table-cell">Origem</th>
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
                    <td className="px-3 py-2.5 text-muted hidden lg:table-cell">
                      {contact.origem || <span className="text-muted/40">—</span>}
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
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id, contact.nome)}
                          className="rounded-md p-2 text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label={`Excluir ${contact.nome}`}
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
        label="contatos"
      />

      {/* Dialog de edição */}
      <Dialog open={!!editContact} onOpenChange={open => { if (!open) setEditContact(null) }}>
        {editContact && (
          <ContactFormDialog
            title="Editar Contato"
            contact={editContact}
            onSubmit={(formData) => handleUpdate(editContact.id, formData)}
            onClose={() => setEditContact(null)}
          />
        )}
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
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Preencha os dados do contato.
        </DialogDescription>
      </DialogHeader>
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium text-foreground">Nome *</label>
          <Input id="nome" name="nome" defaultValue={contact?.nome ?? ''} required minLength={3} />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
          <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ''} />
        </div>
        <div className="space-y-2">
          <label htmlFor="telefone" className="text-sm font-medium text-foreground">Telefone</label>
          <Input id="telefone" name="telefone" defaultValue={contact?.telefone ?? ''} />
        </div>
        <div className="space-y-2">
          <label htmlFor="vendedor" className="text-sm font-medium text-foreground">Vendedor</label>
          <Input id="vendedor" name="vendedor" defaultValue={contact?.vendedor ?? ''} />
        </div>
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
        <div className="flex items-center justify-end gap-3 pt-2">
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
