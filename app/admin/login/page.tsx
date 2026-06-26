'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Form submit triggered', { email, senha: '***' })
    setErro('')
    setCarregando(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      })

      if (error) {
        console.error('Login error:', error)
        setErro(error.message)
        toast.error(error.message)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      console.log('User logged in:', user?.email)
      toast.success('Login realizado!')
      router.replace('/admin')
    } catch (err) {
      console.error('Unexpected error:', err)
      setErro('Erro inesperado')
      toast.error('Erro inesperado')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6"
        noValidate
      >
        <h1 className="text-xl font-bold text-foreground text-center">Admin - VetCongresso</h1>

        {erro && (
          <div className="rounded-md bg-danger/10 p-2 text-sm text-danger" role="alert">
            {erro}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={carregando}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="senha" className="block text-sm font-medium text-foreground">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={carregando}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={carregando || !email || !senha}
          className="w-full rounded-md bg-primary min-h-[44px] px-4 py-2 text-primary-foreground font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {carregando ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  )
}