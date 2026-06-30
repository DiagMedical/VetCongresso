import { listarCertificados } from '@/lib/actions/admin'
import { CertificadosClient } from './certificados-client'
import { AdminPageHeader } from '@/components/admin/page-header'

export default async function CertificadosPage() {
  let dados
  try {
    dados = await listarCertificados()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar certificados. Tente novamente.</p></div>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Certificados"
        description="Participantes com check-in habilitados para emissão do certificado digital."
      />
      <CertificadosClient dados={dados} />
    </div>
  )
}
