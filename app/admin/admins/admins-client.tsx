'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Shield, Plus, Trash2, Loader2 } from 'lucide-react'
import type { Admin } from '@/lib/actions/admin'

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
      <h2 className="text-2xl font-bold text-foreground">Gerenciar Admins</h2>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <label htmlFor="nome" className="text-xs font-medium text-muted">Nome</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={carregando}
            className="w-48 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
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
            className="w-64 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={carregando || !nome || !email}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50"
        >
          {carregando ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Adicionar
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
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
              <tr key={a.id} className="bg-background hover:bg-card/50 transition-colors">
                <td className="px-4 py-3 text-foreground">{a.nome}</td>
                <td className="px-4 py-3 text-muted">{a.email}</td>
                <td className="px-4 py-3 text-muted">
                  {a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRemover(a.id, a.email)}
                    className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                    title="Remover admin"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="mx-auto size-12 text-muted/40" />
            <p className="mt-2 text-sm font-medium text-foreground">Nenhum admin cadastrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
