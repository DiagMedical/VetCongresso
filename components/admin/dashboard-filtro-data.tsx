'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function DashboardFiltroData() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const atual = searchParams.get('dia')

  const dias = [
    { value: null, label: 'Todos' },
    { value: '1', label: 'Dia 1' },
    { value: '2', label: 'Dia 2' },
    { value: '3', label: 'Dia 3' },
  ]

  function handleClick(dia: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (dia) {
      params.set('dia', dia)
    } else {
      params.delete('dia')
    }
    const qs = params.toString()
    router.push(qs ? `/admin?${qs}` : '/admin')
  }

  return (
    <div className="flex gap-1 rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Filtrar por dia">
      {dias.map((d) => {
        const isActive = atual === d.value
        return (
          <button
            key={d.value ?? 'todos'}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleClick(d.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {d.label}
          </button>
        )
      })}
    </div>
  )
}