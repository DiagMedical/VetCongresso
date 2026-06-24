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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { RelatoriosData } from '@/lib/actions/admin'

interface Props {
  data: RelatoriosData
}

const COLORS = ['hsl(213, 100%, 36%)', 'hsl(160, 100%, 33%)', 'hsl(0, 84%, 60%)', 'hsl(39, 100%, 50%)']

export function RelatoriosCharts({ data }: Props) {
  const porDia = data.por_dia.map((d) => ({
    name: `Dia ${d.dia}`,
    Reservas: d.reservas,
    'Check-ins': d.checkins,
    Cancelados: d.cancelados,
    Espera: d.espera,
  }))

  const porPalestra = data.por_palestra
    .sort((a, b) => b.reservas - a.reservas)
    .slice(0, 10)
    .map((p) => ({
      name: p.tema.length > 22 ? p.tema.slice(0, 22) + '…' : p.tema,
      Reservas: p.reservas,
      Checkins: p.checkins,
    }))

  const pieData = [
    { name: 'Check-ins', value: data.total_checkins },
    { name: 'Confirmados', value: data.total_reservas - data.total_checkins },
    { name: 'Cancelados', value: data.total_cancelados },
    { name: 'Espera', value: data.total_espera },
  ].filter((d) => d.value > 0)

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '13px',
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Reservas por Dia</h3>
        {porDia.every((d) => d.Reservas === 0) ? (
          <p className="py-8 text-center text-sm text-muted">Nenhum dado disponível</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={porDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="Reservas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Check-ins" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cancelados" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Espera" fill="hsl(39, 100%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Distribuição de Status</h3>
        {pieData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nenhum dado disponível</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Ranking de Palestras</h3>
        {porPalestra.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nenhum dado disponível</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porPalestra} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted))' }} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: 'hsl(var(--muted))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="Reservas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Checkins" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
