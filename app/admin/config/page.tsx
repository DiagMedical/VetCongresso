import { ConfigPage } from './config-page'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function Config() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Configurações"
        description="Parâmetros do sistema, incluindo e-mail e credenciais do fluxo administrativo."
      />
      <ConfigPage />
    </div>
  )
}
