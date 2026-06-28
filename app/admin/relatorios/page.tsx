import { Users, TicketCheck, UserMinus, TrendingUp, BarChart3, Calendar, Clock } from 'lucide-react'
import { getRelatorios } from '@/lib/actions/admin'
import { KpiCard } from '@/components/admin/kpi-card'
import { BotaoExportarPDF } from '@/components/admin/botao-exportar-pdf'
import { BotaoExportarXLSX } from '@/components/admin/botao-exportar-xlsx'
import { RelatoriosCharts } from './relatorios-charts'
import { RelatoriosTabela } from './relatorios-tabela'
import { BackToTop } from '@/components/back-to-top'

export default async function RelatoriosPage() {
  let data
  try {
    data = await getRelatorios()
  } catch {
    return <div className="space-y-6"><p className="text-muted">Erro ao carregar relatórios. Tente novamente.</p></div>
  }

  const dadosXLSX = data.por_palestra.map((p) => ({
    Palestra: p.tema,
    Palestrante: p.palestrante,
    Dia: p.dia,
    Vagas: p.vagas,
    Reservas: p.reservas,
    'Check-ins': p.checkins,
    Cancelados: p.cancelados,
    Espera: p.espera,
    'Ocupação (%)': p.taxa_ocupacao,
    'Check-in (%)': p.taxa_checkin,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Relatórios</h2>
        <div className="flex items-center gap-2">
          <BotaoExportarXLSX data={dadosXLSX} filename="relatorio-vetcongresso" />
          <BotaoExportarPDF containerId="relatorio-conteudo" filename="relatorio-vetcongresso" />
        </div>
      </div>

      <div id="relatorio-conteudo" className="space-y-6">

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Total de Leads" value={data.total_leads} icon={<Users className="size-5" />} />
        <KpiCard title="Reservas" value={data.total_reservas} icon={<BarChart3 className="size-5" />} />
        <KpiCard title="Check-ins" value={data.total_checkins} icon={<TicketCheck className="size-5" />} />
        <KpiCard title="Cancelados" value={data.total_cancelados} icon={<UserMinus className="size-5" />} />
        <KpiCard title="Lista de Espera" value={data.total_espera} icon={<Clock className="size-5" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <TrendingUp className="size-4" />
            <span>Taxa de Comparecimento</span>
          </div>
          <p className="mt-1 text-3xl font-bold text-foreground">{data.taxa_comparecimento}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar className="size-4" />
            <span>Ocupação Média</span>
          </div>
          <p className="mt-1 text-3xl font-bold text-foreground">{data.ocupacao_media}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="size-4" />
            <span>Demanda (reservas + espera)</span>
          </div>
          <p className="mt-1 text-3xl font-bold text-foreground">{data.total_reservas + data.total_espera}</p>
        </div>
      </div>

      <RelatoriosCharts data={data} />
      <RelatoriosTabela data={data} />
      </div>

      <BackToTop />
    </div>
  )
}
