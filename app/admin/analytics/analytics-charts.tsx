'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import type { AnalyticsData } from '@/lib/actions/admin'
import { AdminSectionCard } from '@/components/admin/section-card'

interface Props {
  data: AnalyticsData
}

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '13px',
}

export function AnalyticsCharts({ data }: Props) {
  const ocupacaoDia = data.ocupacao_por_dia.map((d) => ({
    name: `Dia ${d.dia}`,
    Vagas: d.vagas,
    Reservas: d.reservas,
    Ocupação: d.taxa,
  }))

  const ranking = data.por_palestra
    .sort((a, b) => b.taxa_ocupacao - a.taxa_ocupacao)
    .slice(0, 10)
    .map((p) => ({
      name: p.tema.length > 22 ? `${p.tema.slice(0, 22)}…` : p.tema,
      'Taxa %': p.taxa_ocupacao,
      Reservas: p.reservas,
    }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminSectionCard
        title="Evolução Diária (30 dias)"
        description="Acompanhe a evolução das reservas e check-ins ao longo do último mês."
      >
        {data.evolucao_diaria.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nenhum dado nos últimos 30 dias</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.evolucao_diaria}>
              <defs>
                <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="reservas" stroke="hsl(var(--primary))" fill="url(#colorReservas)" strokeWidth={2} />
              <Area type="monotone" dataKey="checkins" stroke="hsl(var(--success))" fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Ocupação por Dia do Evento"
        description="Comparativo entre vagas, reservas e ocupação por dia do congresso."
      >
        {ocupacaoDia.every((d) => d.Reservas === 0) ? (
          <p className="py-8 text-center text-sm text-muted">Nenhum dado disponível</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ocupacaoDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar yAxisId="left" dataKey="Reservas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="Ocupação" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Horários de Pico (Reservas)"
        description="Veja os horários em que a demanda mais concentra inscrições."
      >
        {data.horarios_pico.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nenhum dado disponível</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.horarios_pico}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hora" tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="reservas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AdminSectionCard>

      <AdminSectionCard
        title="Ranking por Taxa de Ocupação"
        description="As palestras com maior taxa de ocupação, ordenadas da mais cheia para a menos cheia."
      >
        {ranking.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nenhum dado disponível</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ranking} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Taxa %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </AdminSectionCard>
    </div>
  )
}
