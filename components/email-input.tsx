'use client'

import { useState } from 'react'

const DOMINIOS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com']

interface EmailInputProps {
  id?: string
  name: string
  autoComplete?: string
  placeholder?: string
  required?: boolean
  defaultValue?: string
  className?: string
  error?: string
  errorId?: string
  onBlur?: (value: string) => void
}

export function EmailInput({
  id,
  name,
  autoComplete,
  placeholder,
  required,
  defaultValue = '',
  className,
  error,
  errorId,
  onBlur,
}: EmailInputProps) {
  const [value, setValue] = useState(defaultValue)
  const mostrarChips = value.trim().length > 0 && !value.includes('@')

  function aplicarDominio(dominio: string) {
    let base = value.trim()
    const arroba = base.indexOf('@')
    if (arroba !== -1) base = base.slice(0, arroba)
    const proximo = base + dominio
    setValue(proximo)
    onBlur?.(proximo)
  }

  return (
    <div className="space-y-2">
      <input
        id={id}
        name={name}
        type="email"
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => onBlur?.(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={className}
      />
      {mostrarChips && (
        <div className="flex flex-wrap gap-1.5">
          {DOMINIOS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => aplicarDominio(d)}
              className="inline-flex min-h-[36px] items-center rounded-full border border-border bg-card px-3 text-xs text-muted transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              {d}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
