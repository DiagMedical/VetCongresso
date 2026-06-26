'use client'

import { TrendingUp, Users, TicketCheck, Clock, AlertTriangle, Target } from 'lucide-react'
import type { AnalyticsData } from '@/lib/actions/admin'

interface Props {
  data: AnalyticsData
}

export function AnalyticsKpis({ data }: Props) {
  const kpis = [
    {
      title: 'Taxa de Comparecimento',
      value: `${data.taxa_comparecimento}%`,
      icon: <TicketCheck className="size-5" />,
      color: 'text-success',
    },
    {
      title: 'Tempo Médio até Check-in',
      value: `${data.tempo_medio_ate_checkin_horas}h`,
      icon: <Clock className="size-5" />,
      color: 'text-primary',
    },
    {
      title: 'Ocupação Média',
      value: `${data.ocupacao_media}%`,
      icon: <Target className="size-5" />,
      color: 'text-primary',
    },
    {
      title: 'Previsão Ocupação Final',
      value: `${data.previsao_ocupacao_final}%`,
      icon: <TrendingUp className="size-5" />,
      color: data.previsao_ocupacao_final >= 80 ? 'text-success' : data.previsao_ocupacao_final >= 50 ? 'text-primary' : 'text-muted',
    },
    {
      title: 'Cancelamentos',
      value: data.total_cancelados,
      icon: <AlertTriangle className="size-5" />,
      color: 'text-danger',
    },
    {
      title: 'Leads Totais',
      value: data.total_leads,
      icon: <Users className="size-5" />,
      color: 'text-muted',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <div key={kpi.title} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className={`${kpi.color}`}>{kpi.icon}</div>
          <div>
            <p className="text-xs text-muted">{kpi.title}</p>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
