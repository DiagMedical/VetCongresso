import { CadastroSorteio } from './cadastro-form'

export default function CadastroPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-1 text-center text-xl font-bold text-foreground">
          Sorteio Powerbank
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          Preencha seus dados para concorrer.
        </p>
        <CadastroSorteio />
      </div>
    </div>
  )
}
