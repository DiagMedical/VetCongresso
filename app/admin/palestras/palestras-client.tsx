'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Copy, Edit, Plus, Power, PowerOff } from 'lucide-react'
import type { Palestra } from '@/types'
import { PalestraDialog } from '@/components/admin/palestra-dialog'
import type { PalestraFormData } from '@/types'

interface PalestrasClientProps {
  palestras: Palestra[]
}

export function PalestrasClient({ palestras }: PalestrasClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Palestra | null>(null)

  async function handleSave(data: PalestraFormData) {
    const { criarPalestra, editarPalestra } = await import('@/lib/actions/palestras')

    if (editando) {
      await editarPalestra(editando.id, data)
    } else {
      await criarPalestra(data)
    }

    setDialogOpen(false)
    setEditando(null)
    router.refresh()
  }

  async function handleToggleStatus(id: string) {
    const { desativarPalestra } = await import('@/lib/actions/palestras')
    await desativarPalestra(id)
    router.refresh()
  }

  async function handleDuplicar(id: string) {
    const { duplicarPalestra } = await import('@/lib/actions/palestras')
    await duplicarPalestra(id)
    router.refresh()
  }

  function openNew() {
    setEditando(null)
    setDialogOpen(true)
  }

  function openEdit(p: Palestra) {
    setEditando(p)
    setDialogOpen(true)
  }

  return (
    <>
      <button
        onClick={openNew}
        className="mb-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground font-medium hover:brightness-110 transition-all"
      >
        <Plus className="size-4" />
        Nova Palestra
      </button>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card">
            <tr className="text-left text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Dia</th>
              <th scope="col" className="px-4 py-3 font-medium">Tema</th>
              <th scope="col" className="px-4 py-3 font-medium">Palestrante</th>
              <th scope="col" className="px-4 py-3 font-medium">Horário</th>
              <th scope="col" className="px-4 py-3 font-medium">Vagas</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {palestras.map((p) => {
              const inicio = new Date(p.horario_inicio)
              const fim = new Date(p.horario_fim)
              const horario = `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

              return (
                <tr key={p.id} className="bg-background hover:bg-card/50 transition-colors">
                  <td className="px-4 py-3 text-foreground">{p.dia_evento}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.tema}</td>
                  <td className="px-4 py-3 text-muted">{p.palestrante}</td>
                  <td className="px-4 py-3 text-muted">{horario}</td>
                  <td className="px-4 py-3 text-foreground">{p.vagas_totais}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.ativo
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-md p-1.5 text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicar(p.id)}
                        className="rounded-md p-1.5 text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Duplicar"
                      >
                        <Copy className="size-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        className={`rounded-md p-1.5 transition-colors ${
                          p.ativo
                            ? 'text-muted hover:bg-danger/10 hover:text-danger'
                            : 'text-muted hover:bg-success/10 hover:text-success'
                        }`}
                        title={p.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {p.ativo ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {palestras.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="mb-4 text-muted/40">
              <BookOpen className="mx-auto size-12" />
            </div>
            <p className="text-sm font-medium text-foreground">Nenhuma palestra cadastrada</p>
            <p className="mt-1 text-xs text-muted">Clique em &ldquo;Nova Palestra&rdquo; para começar.</p>
          </div>
        )}
      </div>

      <PalestraDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditando(null) }}
        onSave={handleSave}
        palestra={editando}
      />
    </>
  )
}
