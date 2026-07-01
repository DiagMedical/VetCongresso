'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
  label?: string
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  label = 'itens',
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return totalItems != null ? (
      <p className="text-xs text-muted">
        Mostrando {totalItems} {label}
        {pageSize && totalItems > pageSize ? ` (página 1 de 1)` : ''}
      </p>
    ) : null
  }

  const pages = (() => {
    const visible = 5
    if (totalPages <= visible) return range(1, totalPages)

    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + visible - 1)
    const adjustedStart = Math.max(1, end - visible + 1)
    return range(adjustedStart, end)
  })()

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted">
        Página {currentPage} de {totalPages}
        {totalItems != null ? ` · ${totalItems} ${label}` : ''}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`min-h-[44px] min-w-9 rounded-md border px-3 py-2 text-xs transition-colors ${
                page === currentPage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted hover:bg-card hover:text-foreground'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
