import type { Inscrito } from '@/types'

export function confirmacaoMsg(i: Inscrito): string {
  const p = i.palestra
  const data = p ? new Date(p.horario_inicio).toLocaleDateString('pt-BR') : ''
  const hora = p ? new Date(p.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
  return (
    `✅ *Reserva Confirmada!*\n\n` +
    `Olá ${i.nome}, sua vaga para *${p?.tema ?? 'palestra'}* foi garantida!\n\n` +
    `📅 ${data} às ${hora}\n` +
    `📍 VetCongresso 2026\n\n` +
    `Apresente o QR Code na entrada. Até lá! 🎉`
  )
}

export function esperaMsg(i: Inscrito): string {
  const p = i.palestra
  return (
    `⏳ *Lista de Espera*\n\n` +
    `Olá ${i.nome}, você entrou na lista de espera para *${p?.tema ?? 'palestra'}*.\n\n` +
    `Assim que uma vaga for liberada, avisaremos por aqui.\n` +
    `Obrigado pelo interesse! 🙏`
  )
}

export function checkinMsg(i: Inscrito): string {
  const p = i.palestra
  return (
    `✅ *Check-in Realizado!*\n\n` +
    `Olá ${i.nome}, seu check-in para *${p?.tema ?? 'palestra'}* foi confirmado.\n\n` +
    `Bom evento! 🎉`
  )
}

export function promovidoMsg(i: Inscrito): string {
  const p = i.palestra
  const data = p ? new Date(p.horario_inicio).toLocaleDateString('pt-BR') : ''
  const hora = p ? new Date(p.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
  return (
    `🎉 *Vaga Liberada!*\n\n` +
    `Olá ${i.nome}, uma vaga para *${p?.tema ?? 'palestra'}* foi liberada!\n\n` +
    `📅 ${data} às ${hora}\n` +
    `📍 VetCongresso 2026\n\n` +
    `Sua reserva foi confirmada automaticamente. Apresente o QR Code na entrada. Até lá! 🎉`
  )
}

export function lembreteMsg(i: Inscrito): string {
  const p = i.palestra
  const data = p ? new Date(p.horario_inicio).toLocaleDateString('pt-BR') : ''
  const hora = p ? new Date(p.horario_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
  return (
    `⏰ *Lembrete: Palestra Amanhã!*\n\n` +
    `Olá ${i.nome}, não se esqueça da palestra de amanhã:\n\n` +
    `📖 *${p?.tema ?? 'palestra'}*\n` +
    `👨‍⚕️ ${p?.palestrante ?? ''}\n` +
    `📅 ${data} às ${hora}\n` +
    `📍 VetCongresso 2026\n\n` +
    `Chegue com antecedência e apresente o QR Code na entrada. Até lá! 🎉`
  )
}

export function cancelamentoMsg(i: Inscrito): string {
  const p = i.palestra
  return (
    `❌ *Reserva Cancelada*\n\n` +
    `Olá ${i.nome}, sua reserva para *${p?.tema ?? 'palestra'}* foi cancelada.\n\n` +
    `Se tiver dúvidas, procure a organização do evento.`
  )
}
