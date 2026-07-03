'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { reservaSchema } from '@/lib/schemas'
import { toast } from 'sonner'
import { EmailInput } from '@/components/email-input'

interface ReservaFormProps {
  palestra: {
    id: string
    tema: string
    vagas_restantes: number
    vagas_totais: number
  }
  vendedores?: string[]
}

export function ReservaForm({ palestra, vendedores = [] }: ReservaFormProps) {
  const router = useRouter()
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [aceite, setAceite] = useState(false)
  const [vendedor, setVendedor] = useState('')
  const nomeRef = useRef<HTMLInputElement>(null)
  const vagas = palestra.vagas_restantes ?? palestra.vagas_totais

  useEffect(() => {
    nomeRef.current?.focus()
  }, [])

  function getErrorId(field: string) {
    return `${uid}-${field}-error`
  }

  function validateField(name: string, value: string | boolean) {
    const form = formRef.current
    const data = {
      palestra_id: palestra.id,
      nome: (form?.elements.namedItem('nome') as HTMLInputElement)?.value ?? '',
      email: (form?.elements.namedItem('email') as HTMLInputElement)?.value ?? '',
      telefone: (form?.elements.namedItem('telefone') as HTMLInputElement)?.value ?? '',
      aceite_lgpd: name === 'aceite_lgpd' ? (value as boolean) : aceite,
    }
    const parsed = reservaSchema.safeParse(data)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string
        if (!errors[field]) errors[field] = issue.message
      }
      setFieldErrors((prev) => ({ ...prev, [name]: errors[name] }))
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function focusFirstError() {
    const firstError = Object.entries(fieldErrors).find(([, v]) => v)
    if (firstError) {
      const el = document.getElementById(firstError[0])
      el?.focus()
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setEnviando(true)

    const form = new FormData(e.currentTarget)
    const data = {
      palestra_id: palestra.id,
      nome: (form.get('nome') as string).trim(),
      email: (form.get('email') as string).trim(),
      telefone: (form.get('telefone') as string).trim(),
      aceite_lgpd: aceite,
    }

    const parsed = reservaSchema.safeParse(data)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string
        if (!errors[field]) errors[field] = issue.message
      }
      setFieldErrors(errors)
      setEnviando(false)
      setTimeout(focusFirstError, 0)
      return
    }

    try {
      const { criarReserva } = await import('@/lib/actions/reserva')
      const inscrito = await criarReserva({ ...data, vendedor })
      toast.success('Reserva confirmada!')
      router.push(`/ticket/${inscrito.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao reservar'
      toast.error(msg)
    } finally {
      setEnviando(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-md border bg-background px-3 py-2 text-foreground ${
      fieldErrors[field] ? 'border-danger' : 'border-border'
    }`

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 animate-fade-in" noValidate>

      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium text-foreground">
          Nome completo <span aria-hidden="true">*</span>
        </label>
        <input
          ref={nomeRef}
          id="nome"
          name="nome"
          type="text"
          defaultValue=""
          autoComplete="name"
          onBlur={(e) => validateField('nome', e.target.value)}
          aria-invalid={!!fieldErrors.nome}
          aria-describedby={fieldErrors.nome ? getErrorId('nome') : undefined}
          className={inputClass('nome')}
        />
        {fieldErrors.nome && (
          <p id={getErrorId('nome')} role="alert" className="text-xs text-danger">
            {fieldErrors.nome}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          E-mail <span aria-hidden="true">*</span>
        </label>
        <EmailInput
          id="email"
          name="email"
          autoComplete="email"
          onBlur={(v) => validateField('email', v)}
          error={fieldErrors.email}
          errorId={getErrorId('email')}
          className={inputClass('email')}
        />
        {fieldErrors.email && (
          <p id={getErrorId('email')} role="alert" className="text-xs text-danger">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="telefone" className="text-sm font-medium text-foreground">
          Telefone <span aria-hidden="true">*</span>
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          defaultValue=""
          autoComplete="tel"
          onBlur={(e) => validateField('telefone', e.target.value)}
          aria-invalid={!!fieldErrors.telefone}
          aria-describedby={fieldErrors.telefone ? getErrorId('telefone') : undefined}
          className={inputClass('telefone')}
        />
        {fieldErrors.telefone && (
          <p id={getErrorId('telefone')} role="alert" className="text-xs text-danger">
            {fieldErrors.telefone}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className={`flex items-start gap-2 text-sm ${fieldErrors.aceite_lgpd ? 'text-danger' : 'text-foreground'}`}>
          <input
            type="checkbox"
            checked={aceite}
            onChange={(e) => { setAceite(e.target.checked); validateField('aceite_lgpd', e.target.checked) }}
            aria-invalid={!!fieldErrors.aceite_lgpd}
            aria-describedby={fieldErrors.aceite_lgpd ? getErrorId('aceite_lgpd') : undefined}
            className="mt-0.5"
          />
          Autorizo o tratamento dos meus dados conforme a Lei Geral de Proteção de Dados (LGPD)
        </label>
        {fieldErrors.aceite_lgpd && (
          <p id={getErrorId('aceite_lgpd')} role="alert" className="text-xs text-danger">
            {fieldErrors.aceite_lgpd}
          </p>
        )}
      </div>

      {vendedores.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {vendedores.map((nome) => (
              <button
                key={nome}
                type="button"
                onClick={() => setVendedor(vendedor === nome ? '' : nome)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  vendedor === nome
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card text-muted ring-1 ring-border hover:ring-primary/40'
                }`}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-card p-3 text-sm text-muted" aria-live="polite">
        <p><strong>Vagas disponíveis:</strong> {vagas}</p>
        {vagas <= 0 && (
          <p className="mt-1 text-xs text-primary">
            Sem vagas no momento. Você entrará na lista de espera.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary min-h-[44px] px-4 py-2 text-primary-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50"
      >
        {enviando ? (
          <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Reservando...</>
        ) : (
          vagas <= 0 ? 'Entrar na lista de espera' : 'Confirmar reserva'
        )}
      </button>
    </form>
  )
}
