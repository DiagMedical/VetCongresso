'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Mail, MessageSquare, CalendarDays, StickyNote, Users, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { AdminSectionCard } from '@/components/admin/section-card'
import { formatDate } from '@/lib/utils'
import { createActivity } from '@/lib/actions/crm'
import type { Activity, ActivityTipo } from '@/types'

interface ActivitiesTimelineProps {
  activities: Activity[]
}

const TIPO_ICON: Record<ActivityTipo, typeof Phone> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: CalendarDays,
  nota: StickyNote,
  task: CalendarDays,
}

const TIPO_LABEL: Record<ActivityTipo, string> = {
  call: 'Ligação',
  email: 'Email',
  whatsapp: 'WhatsApp',
  meeting: 'Reunião',
  nota: 'Nota',
  task: 'Tarefa',
}

const TIPO_COLOR: Record<ActivityTipo, string> = {
  call: 'text-blue-400 bg-blue-500/10',
  email: 'text-purple-400 bg-purple-500/10',
  whatsapp: 'text-green-400 bg-green-500/10',
  meeting: 'text-orange-400 bg-orange-500/10',
  nota: 'text-yellow-400 bg-yellow-500/10',
  task: 'text-pink-400 bg-pink-500/10',
}

export function ActivitiesTimeline({ activities }: ActivitiesTimelineProps) {
  const router = useRouter()
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

  const filtradas = filtroTipo
    ? activities.filter(a => a.tipo === filtroTipo)
    : activities

  async function handleCreate(formData: FormData) {
    try {
      await createActivity({
        tipo: formData.get('tipo') as ActivityTipo,
        descricao: formData.get('descricao') as string,
        responsavel: formData.get('responsavel') as string,
        concluido: true,
      })
      setShowForm(false)
      toast.success('Atividade registrada!')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar atividade')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtro + nova atividade */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1">
          {(['', 'call', 'email', 'whatsapp', 'meeting', 'nota', 'task'] as const).map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                filtroTipo === tipo
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tipo ? TIPO_LABEL[tipo] : 'Todas'}
            </button>
          ))}
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger render={<Button className="gap-2"><Plus className="size-4" />Nova Atividade</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Atividade</DialogTitle>
              <DialogDescription>Registre uma nova atividade.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="tipo" className="text-sm font-medium text-foreground">Tipo *</label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="nota">Nota</option>
                  <option value="call">Ligação</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="meeting">Reunião</option>
                  <option value="task">Tarefa</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="descricao" className="text-sm font-medium text-foreground">Descrição *</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  required
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="responsavel" className="text-sm font-medium text-foreground">Responsável</label>
                <Input id="responsavel" name="responsavel" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <DialogClose type="button" className="rounded-md px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">
                  Cancelar
                </DialogClose>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline */}
      <AdminSectionCard>
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="size-12 text-muted/40" />
            <p className="text-sm text-muted">Nenhuma atividade registrada ainda.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" aria-hidden="true" />

            <div className="space-y-6">
              {filtradas.map(activity => {
                const Icon = TIPO_ICON[activity.tipo]
                const colorClass = TIPO_COLOR[activity.tipo]

                return (
                  <div key={activity.id} className="relative flex gap-4 pl-0">
                    {/* Ícone do tipo */}
                    <div className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="size-4" />
                    </div>
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{TIPO_LABEL[activity.tipo]}</span>
                        <span className="text-xs text-muted">{formatDate(activity.data_atividade)}</span>
                        {activity.responsavel && (
                          <span className="text-xs text-muted">· {activity.responsavel}</span>
                        )}
                        {!activity.concluido && (
                          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] text-yellow-400 font-medium">Pendente</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {activity.descricao}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </AdminSectionCard>
    </div>
  )
}
