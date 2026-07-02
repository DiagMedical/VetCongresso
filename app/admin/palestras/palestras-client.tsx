'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BookOpen, Copy, Edit, Plus, Power, PowerOff, Trash2, Calendar, Users } from 'lucide-react'
import type { Palestra } from '@/types'
import { PalestraDialog } from '@/components/admin/palestra-dialog'
import type { PalestraFormData } from '@/types'
import { buildGoogleCalendarUrl, buildAppleCalendarUrl } from '@/lib/calendar'
import { VerInscritosDialog } from '@/components/admin/ver-inscritos-dialog'
import { Badge } from '@/components/ui/badge'

interface PalestrasClientProps {
  palestras: Palestra[]
}

export function PalestrasClient({ palestras }: PalestrasClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Palestra | null>(null)
  const [verInscritosPalestra, setVerInscritosPalestra] = useState<{ id: string; tema: string } | null>(null)

  async function handleSave(data: PalestraFormData) {
    try {
      const { criarPalestra, editarPalestra } = await import('@/lib/actions/palestras')

      if (editando) {
        await editarPalestra(editando.id, data)
      } else {
        await criarPalestra(data)
      }

      setDialogOpen(false)
      setEditando(null)
      toast.success(editando ? 'Palestra atualizada!' : 'Palestra criada!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  async function handleToggleStatus(id: string) {
    try {
      const { desativarPalestra } = await import('@/lib/actions/palestras')
      await desativarPalestra(id)
      toast.success('Status alterado!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar status')
    }
  }

  async function handleDuplicar(id: string) {
    try {
      const { duplicarPalestra } = await import('@/lib/actions/palestras')
      await duplicarPalestra(id)
      toast.success('Palestra duplicada!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao duplicar')
    }
  }

  async function handleExcluir(id: string, tema: string) {
    if (!confirm(`Excluir palestra "${tema}"? Essa ação não pode ser desfeita.`)) return
    try {
      const { excluirPalestra } = await import('@/lib/actions/palestras')
      await excluirPalestra(id)
      toast.success('Palestra excluída!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  function openNew() {
    setEditando(null)
    setDialogOpen(true)
  }

  function openEdit(p: Palestra) {
    setEditando(p)
    setDialogOpen(true)
  }

  const [cleanupMsg, setCleanupMsg] = useState('')

  async function handleLimparDuplicatas() {
    if (!confirm('Remover palestras duplicadas? Isso vai apagar também os inscritos vinculados.')) return
    try {
      const { limparPalestrasDuplicadas } = await import('@/lib/actions/admin')
      const { removidas } = await limparPalestrasDuplicadas()
      setCleanupMsg(`${removidas} duplicata(s) removida(s)`)
      if (removidas > 0) toast.success(`${removidas} duplicata(s) removida(s)!`)
      else toast.info('Nenhuma duplicata encontrada')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao limpar duplicatas')
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground font-medium hover:brightness-110 transition-all"
        >
          <Plus className="size-4" />
          Nova Palestra
        </button>
        <button
          onClick={handleLimparDuplicatas}
          className="flex items-center gap-2 rounded-md border border-danger/30 px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-all"
        >
          <Trash2 className="size-4" />
          Limpar Duplicatas
        </button>
        {cleanupMsg && <span className="text-xs text-success">{cleanupMsg}</span>}
      </div>

      {/* Empty state (compartilhado) */}
      {palestras.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-12 text-center animate-fade-in">
          <div className="mb-4 text-muted/40">
            <BookOpen className="mx-auto size-12" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhuma palestra cadastrada</p>
          <p className="mt-1 text-xs text-muted">Clique em &ldquo;Nova Palestra&rdquo; para começar.</p>
        </div>
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
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
                  const horario = `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })} - ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}`

                  return (
                    <tr key={p.id} className="bg-background hover:bg-card/50 transition-colors">
                      <td className="px-4 py-3 text-foreground">{p.dia_evento}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.tema}</td>
                      <td className="px-4 py-3 text-muted">{p.palestrante}</td>
                      <td className="px-4 py-3 text-muted">{horario}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={p.vagas_restantes && p.vagas_restantes > 0 ? 'secondary' : 'destructive'}>
                            {p.vagas_restantes ?? p.vagas_totais} restantes
                          </Badge>
                          <span className="text-xs text-muted">
                            de {p.vagas_totais}
                          </span>
                        </div>
                      </td>
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
                            onClick={() => setVerInscritosPalestra({ id: p.id, tema: p.tema })}
                            className="rounded-md p-1.5 text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Ver inscritos"
                            aria-label={`Ver inscritos de ${p.tema}`}
                          >
                            <Users className="size-4" />
                          </button>
                          <div className="flex items-center gap-0.5">
                            <a
                              href={buildGoogleCalendarUrl(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md p-1.5 text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                              title="Google Calendar"
                            >
                              <Calendar className="size-4" />
                            </a>
                            <a
                              href={buildAppleCalendarUrl(p)}
                              download="palestra.ics"
                              className="rounded-md p-1.5 text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                              title="Baixar .ics"
                            >
                              <Calendar className="size-4" />
                            </a>
                          </div>
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
                          <button
                            onClick={() => handleExcluir(p.id, p.tema)}
                            className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: card view */}
          <div className="md:hidden space-y-3">
            {palestras.map((p) => {
              const inicio = new Date(p.horario_inicio)
              const fim = new Date(p.horario_fim)
              const horario = `${inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })} - ${fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}`

              return (
                <div key={p.id} className="space-y-3 rounded-lg border border-border bg-background p-4">
                  {/* Tema + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground">{p.tema}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.ativo
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {/* Palestrante + Info */}
                  <div className="space-y-1 text-sm text-muted">
                    <div>{p.palestrante}</div>
                    <div>Dia {p.dia_evento} · {horario}</div>
                  </div>
                  {/* Vagas */}
                  <div className="flex items-center gap-2">
                    <Badge variant={p.vagas_restantes && p.vagas_restantes > 0 ? 'secondary' : 'destructive'}>
                      {p.vagas_restantes ?? p.vagas_totais} restantes
                    </Badge>
                    <span className="text-xs text-muted">de {p.vagas_totais}</span>
                  </div>
                  {/* Ações */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground transition-colors hover:bg-card"
                    >
                      <Edit className="size-4" aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      onClick={() => setVerInscritosPalestra({ id: p.id, tema: p.tema })}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground transition-colors hover:bg-card"
                    >
                      <Users className="size-4" aria-hidden="true" />
                      Inscritos
                    </button>
                    <button
                      onClick={() => handleDuplicar(p.id)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground transition-colors hover:bg-card"
                    >
                      <Copy className="size-4" aria-hidden="true" />
                      Duplicar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(p.id)}
                      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
                        p.ativo
                          ? 'border-danger/30 text-danger hover:bg-danger/5'
                          : 'border-success/30 text-success hover:bg-success/5'
                      }`}
                    >
                      {p.ativo ? <PowerOff className="size-4" aria-hidden="true" /> : <Power className="size-4" aria-hidden="true" />}
                      {p.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <a
                      href={buildGoogleCalendarUrl(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground transition-colors hover:bg-card"
                    >
                      <Calendar className="size-4" aria-hidden="true" />
                      Google
                    </a>
                    <a
                      href={buildAppleCalendarUrl(p)}
                      download="palestra.ics"
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground transition-colors hover:bg-card"
                    >
                      <Calendar className="size-4" aria-hidden="true" />
                      Apple
                    </a>
                    <button
                      onClick={() => handleExcluir(p.id, p.tema)}
                      className="col-span-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-danger/30 px-3 text-sm text-danger transition-colors hover:bg-danger/5"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Excluir palestra
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <PalestraDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditando(null) }}
        onSave={handleSave}
        palestra={editando}
      />

      <VerInscritosDialog
        key={verInscritosPalestra?.id ?? 'none'}
        open={!!verInscritosPalestra}
        onClose={() => setVerInscritosPalestra(null)}
        palestraId={verInscritosPalestra?.id ?? ''}
        palestraNome={verInscritosPalestra?.tema ?? ''}
      />
    </>
  )
}
