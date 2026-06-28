import { listarCertificados } from '@/lib/actions/admin'
import { CertificadosClient } from './certificados-client'

export default async function CertificadosPage() {
  const dados = await listarCertificados()

  return <CertificadosClient dados={dados} />
}
