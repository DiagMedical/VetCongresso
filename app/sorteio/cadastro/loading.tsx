export default function CadastroSorteioLoading() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <section className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted/30" />
          <div className="h-12 w-full animate-pulse rounded-md bg-primary/20" />
        </div>
      </section>
    </div>
  )
}
