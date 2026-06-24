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
} from 'recharts'
import { BarChart3, Activity } from 'lucide-react'
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
    </div>
  )
}
