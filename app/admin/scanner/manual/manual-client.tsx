'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle2, ArrowLeft, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Palestra, Inscrito } from '@/types'

interface Props {
  palestras: Palestra[]
  inscritos: Inscrito[]
}

export function ManualClient({ palestras, inscritos }: Props) {
  const router = useRouter()
  const [palestraId, setPalestraId] = useState('')
  const [busca, setBusca] = useState('')
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [checkinId, setCheckinId] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    let arr = inscritos

    if (palestraId) arr = arr.filter((i) => i.palestra_id === palestraId)

    if (busca.trim()) {
      const termo = busca.toLowerCase().trim()
      arr = arr.filter(
        (i) =>
          i.nome.toLowerCase().includes(termo) ||
          i.email.toLowerCase().includes(termo)
      )
    }

    return arr.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [inscritos, palestraId, busca])

  const statusColors: Record<string, string> = {
    confirmado: 'bg-primary/10 text-primary',
    'check-in': 'bg-success/10 text-success',
    cancelado_por_falta: 'bg-danger/10 text-danger',
    espera: 'bg-muted/10 text-muted',
  }

  const statusLabels: Record<string, string> = {
    confirmado: 'Confirmado',
    'check-in': 'Check-in',
    cancelado_por_falta: 'Cancelado',
    espera: 'Espera',
  }

  function toggleSelecionado(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCheckin(inscritoId: string) {
    setCheckinId(inscritoId)
    try {
      const { realizarCheckInAdmin } = await import('@/lib/actions/admin')
      await realizarCheckInAdmin(inscritoId)
      toast.success('Check-in realizado!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao realizar check-in')
    } finally {
      setCheckinId(null)
    }
  }

  async function handleCheckinLote() {
    if (selecionados.size === 0) {
      toast.error('Selecione ao menos um participante')
      return
    }

    const { realizarCheckInAdmin } = await import('@/lib/actions/admin')
    let sucessos = 0
    let erros = 0

    for (const id of selecionados) {
      try {
        await realizarCheckInAdmin(id)
        sucessos++
      } catch {
        erros++
      }
    }

    if (sucessos > 0) toast.success(`${sucessos} check-in(s) realizados!`)
    if (erros > 0) toast.error(`${erros} falha(s)`)
    setSelecionados(new Set())
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/scanner"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar ao Scanner
      </Link>

      <h2 className="text-2xl font-bold text-foreground">Check-in Manual</h2>
      <p className="text-sm text-muted">
        Busque por nome ou email do participante e realize o check-in manualmente.
      </p>

      <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
        <select
          value={palestraId}
          onChange={(e) => setPalestraId(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground xl:w-auto"
          aria-label="Filtrar por palestra"
        >
          <option value="">Todas as palestras</option>
          {palestras.map((p) => (
            <option key={p.id} value={p.id}>
              Dia {p.dia_evento} — {p.tema}
            </option>
          ))}
        </select>

        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            aria-label="Buscar participante"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground"
          />
        </div>

        {selecionados.size > 0 && (
          <button
            onClick={handleCheckinLote}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            <CheckSquare className="size-4" />
            Check-in em Lote ({selecionados.size})
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm" aria-label="Participantes">
          <caption className="sr-only">Lista de participantes</caption>
          <thead className="bg-card">
            <tr className="text-left text-muted">
              <th scope="col" className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  onChange={() => {
                    if (selecionados.size === filtrados.length) setSelecionados(new Set())
                    else setSelecionados(new Set(filtrados.filter(i => i.status === 'confirmado').map(i => i.id)))
                  }}
                  checked={selecionados.size === filtrados.filter(i => i.status === 'confirmado').length && filtrados.length > 0}
                  className="size-4"
                  aria-label="Selecionar todos"
                />
              </th>
              <th scope="col" className="px-4 py-3 font-medium">Nome</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Palestra</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((i) => (
              <tr key={i.id} className="bg-background hover:bg-card/50 transition-colors">
                <td className="px-4 py-3">
                  {i.status === 'confirmado' && (
                    <input
                      type="checkbox"
                      checked={selecionados.has(i.id)}
                      onChange={() => toggleSelecionado(i.id)}
                      className="size-4"
                      aria-label={`Selecionar ${i.nome}`}
                    />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{i.nome}</td>
                <td className="px-4 py-3 text-muted">{i.email}</td>
                <td className="px-4 py-3 text-foreground">
                  {i.palestra?.tema ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[i.status] ?? ''}`}>
                    {statusLabels[i.status] ?? i.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {i.status === 'confirmado' && (
                    <button
                      onClick={() => handleCheckin(i.id)}
                      disabled={checkinId === i.id}
                      className="flex items-center gap-1 rounded-md bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-all disabled:opacity-50"
                    >
                      {checkinId === i.id ? (
                        '...'
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          Check-in
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 size-12 text-muted/40" />
            <p className="text-sm font-medium text-foreground">
              {busca || palestraId
                ? 'Nenhum participante encontrado'
                : 'Selecione uma palestra ou busque por nome'}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        Exibindo {filtrados.length} de {inscritos.length} participantes
      </p>
    </div>
  )
}
