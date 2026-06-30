'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Shield, Plus, Trash2, Loader2 } from 'lucide-react'
import type { Admin } from '@/lib/actions/admin'
import { AdminSectionCard } from '@/components/admin/section-card'

interface AdminsClientProps {
  admins: Admin[]
}

export function AdminsClient({ admins }: AdminsClientProps) {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    try {
      const { adicionarAdmin } = await import('@/lib/actions/admin')
      await adicionarAdmin(nome.trim(), email.trim())
      toast.success('Admin adicionado!')
      setNome('')
      setEmail('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar admin')
    } finally {
      setCarregando(false)
    }
  }

  async function handleRemover(id: string, emailAdmin: string) {
    if (!confirm(`Remover admin "${emailAdmin}"?`)) return
    try {
      const { removerAdmin } = await import('@/lib/actions/admin')
      await removerAdmin(id)
      toast.success('Admin removido!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover admin')
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Adicionar Admin"
        description="Crie ou remova acessos administrativos sem abrir o banco manualmente."
        icon={<Shield className="size-4" aria-hidden="true" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="space-y-1">
            <label htmlFor="nome" className="text-xs font-medium text-muted">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={carregando}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50 lg:w-56"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-medium text-muted">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={carregando}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50 lg:w-72"
            />
          </div>
          <button
            type="submit"
            disabled={carregando || !nome || !email}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
          >
            {carregando ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Adicionar
          </button>
        </form>
      </AdminSectionCard>

      <AdminSectionCard
        title="Lista de Admins"
        description={`${admins.length} admin(s) cadastrados`}
      >
        {admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="mx-auto size-12 text-muted/40" />
            <p className="mt-2 text-sm font-medium text-foreground">Nenhum admin cadastrado</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-card">
                  <tr className="text-left text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">Nome</th>
                    <th scope="col" className="px-4 py-3 font-medium">Email</th>
                    <th scope="col" className="px-4 py-3 font-medium">Desde</th>
                    <th scope="col" className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {admins.map((a) => (
                    <tr key={a.id} className="bg-background transition-colors hover:bg-card/50">
                      <td className="px-4 py-3 text-foreground">{a.nome}</td>
                      <td className="px-4 py-3 text-muted">{a.email}</td>
                      <td className="px-4 py-3 text-muted">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemover(a.id, a.email)}
                          className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                          title="Remover admin"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminSectionCard>
    </div>
  )
}
