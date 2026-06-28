import { listarCertificados } from '@/lib/actions/admin'
import { CertificadosClient } from './certificados-client'

export default async function CertificadosPage() {
  let dados
  try {
    dados = await listarCertificados()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar certificados. Tente novamente.</p></div>
  }

  return <CertificadosClient dados={dados} />
}
