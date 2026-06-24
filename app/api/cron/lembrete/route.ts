import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendText } from '@/lib/whatsapp/client'
import { lembreteMsg } from '@/lib/whatsapp/messages'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const agora = new Date()
  const amanhaInicio = new Date(agora.getTime() + 23 * 60 * 60 * 1000)
  const amanhaFim = new Date(agora.getTime() + 25 * 60 * 60 * 1000)

  const { data: palestras } = await supabase
    .from('palestras')
    .select('id')
    .gte('horario_inicio', amanhaInicio.toISOString())
    .lt('horario_inicio', amanhaFim.toISOString())
    .eq('ativo', true)

  if (!palestras || palestras.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Nenhuma palestra nas próximas 24h' })
  }

  const palestraIds = palestras.map((p) => p.id)

  const { data: inscritos } = await supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(*)')
    .in('palestra_id', palestraIds)
    .eq('status', 'confirmado')
    .eq('lembrete_enviado', false)

  if (!inscritos || inscritos.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Nenhum lembrete pendente' })
  }

  let enviados = 0
  let falhas = 0

  for (const i of inscritos) {
    const message = lembreteMsg(i)
    const result = await sendText(i.telefone, message)

    await supabase.from('mensagens_enviadas').insert({
      inscrito_id: i.id,
      telefone: i.telefone,
      tipo: 'lembrete',
      mensagem: message,
      sucesso: result.sucesso,
      zaap_id: result.zaapId ?? null,
      erro: result.erro ?? null,
    })

    await supabase
      .from('inscritos')
      .update({ lembrete_enviado: true })
      .eq('id', i.id)

    if (result.sucesso) enviados++
    else falhas++
  }

  return NextResponse.json({ sent: enviados, failed: falhas, total: inscritos.length })
}
