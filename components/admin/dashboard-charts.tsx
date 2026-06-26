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
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { BarChart3, Activity, TrendingUp } from 'lucide-react'
import type { DashboardData } from '@/lib/actions/admin'

interface DashboardChartsProps {
  data: DashboardData
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const porDia = data.reservas_por_dia.map((d) => ({
    name: `Dia ${d.dia}`,
    Reservas: d.reservas,
    'Check-ins': d.checkins,
  }))

  const evolucaoLeads = data.reservas_por_dia
    .sort((a, b) => a.dia - b.dia)
    .map((d) => ({
      name: d.dia.toString(),
      leads: d.reservas,
    }))

  const porPalestra = data.reservas_por_palestra
    .sort((a, b) => b.reservas - a.reservas)
    .slice(0, 10)
    .map((p) => ({
      name: p.tema.length > 25 ? p.tema.slice(0, 25) + '…' : p.tema,
      Reservas: p.reservas,
      'Check-ins': p.checkins,
    }))

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Reservas por Dia</h3>
        {porDia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="mb-3 size-10 text-muted/40" />
            <p className="text-sm text-muted">Nenhum dado disponível</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Legend />
              <Bar dataKey="Reservas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Check-ins" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Leads por Dia (tendência)</h3>
        {evolucaoLeads.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="mb-3 size-10 text-muted/40" />
            <p className="text-sm text-muted">Dados insuficientes para exibir tendência</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolucaoLeads}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Top Palestras</h3>
        {porPalestra.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-3 size-10 text-muted/40" />
            <p className="text-sm text-muted">Nenhum dado disponível</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porPalestra} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Legend />
              <Bar dataKey="Reservas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Ocupação por Palestra</h3>
        {data.reservas_por_palestra.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-3 size-10 text-muted/40" />
            <p className="text-sm text-muted">Nenhum dado disponível</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.reservas_por_palestra
                .sort((a, b) => b.taxa_ocupacao - a.taxa_ocupacao)
                .slice(0, 10)
                .map((p) => ({
                  name: p.tema.length > 25 ? p.tema.slice(0, 25) + '…' : p.tema,
                  ocupacao: p.taxa_ocupacao,
                }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} unit="%" />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                formatter={(value) => [`${value}%`, 'Ocupação']}
              />
              <Bar dataKey="ocupacao" radius={[0, 4, 4, 0]}>
                {data.reservas_por_palestra
                  .sort((a, b) => b.taxa_ocupacao - a.taxa_ocupacao)
                  .slice(0, 10)
                  .map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.taxa_ocupacao >= 80
                          ? 'hsl(var(--success))'
                          : entry.taxa_ocupacao >= 50
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--danger))'
                      }
                    />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
