import { WhatsAppConfig } from './whatsapp-config'
import { AdminPageHeader } from '@/components/admin/page-header'

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="WhatsApp"
        description="Configuração da integração, teste de envio e histórico de mensagens."
      />
      <WhatsAppConfig />
    </div>
  )
}
