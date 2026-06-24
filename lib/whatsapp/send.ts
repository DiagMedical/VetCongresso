import { createClient } from '@/lib/supabase/server'
import { sendText } from './client'
import {
  confirmacaoMsg,
  esperaMsg,
  checkinMsg,
  promovidoMsg,
  lembreteMsg,
  cancelamentoMsg,
} from './messages'

type TipoMensagem = 'confirmacao' | 'espera' | 'checkin' | 'promovido' | 'lembrete' | 'cancelamento'

export async function sendWhatsApp(
  inscritoId: string,
  tipo: TipoMensagem
) {
  const supabase = await createClient()

  const { data: inscrito } = await supabase
    .from('inscritos')
    .select('*, palestra:palestra_id(*)')
    .eq('id', inscritoId)
    .single()

  if (!inscrito) throw new Error('Inscrito não encontrado')

  const msgMap: Record<TipoMensagem, (i: typeof inscrito) => string> = {
    confirmacao: confirmacaoMsg,
    espera: esperaMsg,
    checkin: checkinMsg,
    promovido: promovidoMsg,
    lembrete: lembreteMsg,
    cancelamento: cancelamentoMsg,
  }

  const message = msgMap[tipo](inscrito)
  const result = await sendText(inscrito.telefone, message)

  await supabase.from('mensagens_enviadas').insert({
    inscrito_id: inscritoId,
    telefone: inscrito.telefone,
    tipo,
    mensagem: message,
    sucesso: result.sucesso,
    zaap_id: result.zaapId ?? null,
    erro: result.erro ?? null,
  })

  return result
}
