import { Suspense } from 'react'
import { PalestraCard } from '@/components/palestra-card'
import { listarPalestras } from '@/lib/actions/reserva'
import type { DiaEvento } from '@/types'

function PalestrasSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted/30" />
            <div className="h-5 w-14 shrink-0 animate-pulse rounded-full bg-muted/30" />
          </div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted/30" />
          <div className="h-3 w-full animate-pulse rounded bg-muted/30" />
          <div className="flex items-center gap-4">
            <div className="h-3 w-24 animate-pulse rounded bg-muted/30" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted/30" />
          </div>
          <div className="mt-1 h-8 w-full animate-pulse rounded-md bg-muted/30" />
        </div>
      ))}
    </div>
  )
}

function DiaTab({ dia, atual }: { dia: DiaEvento | null; atual: DiaEvento | null }) {
  const href = dia ? `/palestras/?dia=${dia}` : '/palestras'
  const label = dia ? `Dia ${dia}` : 'Todos'
  const active = atual === dia

  return (
    <a
      href={href}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-muted hover:bg-primary/10'
      }`}
    >
      {label}
    </a>
  )
}

async function PalestrasList({ dia }: { dia: DiaEvento | null }) {
  const palestras = await listarPalestras()

  const filtradas = dia
    ? palestras.filter((p) => p.dia_evento === dia)
    : palestras

  if (filtradas.length === 0) {
    return (
      <p className="text-center text-muted py-12">
        Nenhuma palestra encontrada para este dia.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtradas.map((p) => (
        <PalestraCard key={p.id} palestra={p} />
      ))}
    </div>
  )
}

export default async function PalestrasPage(props: {
  searchParams?: Promise<{ dia?: string }>
}) {
  const searchParams = await props.searchParams
  const diaParam = searchParams?.dia
  const diaAtual = diaParam
    ? ([1, 2, 3].includes(Number(diaParam)) ? (Number(diaParam) as DiaEvento) : null)
    : null

  return (
    <div className="flex flex-1 flex-col bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Programação</h1>
          <p className="mt-2 text-muted">
            Reserve sua vaga nas palestras do congresso veterinário
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <DiaTab dia={null} atual={diaAtual} />
          <DiaTab dia={1} atual={diaAtual} />
          <DiaTab dia={2} atual={diaAtual} />
          <DiaTab dia={3} atual={diaAtual} />
        </div>

        <Suspense fallback={<PalestrasSkeleton />}>
          <PalestrasList dia={diaAtual} />
        </Suspense>
      </section>
    </div>
  )
}
