'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, CheckCircle2 } from 'lucide-react'
import { inscreverSorteio } from '@/lib/actions/sorteio'

export function CadastroSorteio() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const data = {
      nome: (form.elements.namedItem('nome') as HTMLInputElement).value,
      whatsapp: (form.elements.namedItem('whatsapp') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
    }

    try {
      await inscreverSorteio(data)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="size-12 text-success" />
        <p className="text-lg font-semibold text-foreground">Cadastro realizado!</p>
        <p className="text-sm text-muted">
          Boa sorte! O resultado do sorteio será divulgado durante o evento.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="mb-1 block text-xs text-muted">Nome completo</label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="mb-1 block text-xs text-muted">WhatsApp</label>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-xs text-muted">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          placeholder="seu@email.com"
        />
      </div>

      {error && (
        <p className="rounded-md bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
      >
        {loading ? (
          'Cadastrando...'
        ) : (
          <>
            <Gift className="size-4" />
            Quero Participar
          </>
        )}
      </button>
    </form>
  )
}
