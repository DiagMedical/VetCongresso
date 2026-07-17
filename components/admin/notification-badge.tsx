'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function NotificationBadge() {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()

        // Conta contatos sem atividades (leads sem follow-up)
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(200)

        const { data: activities } = await supabase
          .from('activities')
          .select('contact_id')
          .not('contact_id', 'is', null)

        const contactIdsComAtividade = new Set((activities ?? []).map(a => a.contact_id))
        const semFollowup = (contacts ?? []).filter(c => !contactIdsComAtividade.has(c.id)).length

        // Conta deals parados (mais de 7 dias sem atualização)
        const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: stages } = await supabase
          .from('pipeline_stages')
          .select('id')
          .not('nome', 'in', '("Fechado","Perdido")')

        if (stages && stages.length > 0) {
          const stageIds = stages.map(s => s.id)
          const { count: parados } = await supabase
            .from('deals')
            .select('id', { count: 'exact', head: true })
            .in('stage_id', stageIds)
            .lt('updated_at', seteDiasAtras)

          setTotal(semFollowup + (parados ?? 0))
        } else {
          setTotal(semFollowup)
        }
      } catch {
        // Silencia
      }
    }
    load()
    // Recarrega a cada 60s
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  if (total === 0) return null

  return (
    <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
      {total > 9 ? '9+' : total}
    </span>
  )
}
