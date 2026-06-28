import { createClient } from '@/lib/supabase/server'

export async function buildEventContext(): Promise<string> {
  const supabase = await createClient()

  const { data: palestras } = await supabase
    .from('palestras')
    .select('dia_evento, tema, palestrante, horario_inicio, horario_fim, vagas_totais')
    .eq('ativo', true)
    .order('dia_evento')
    .order('horario_inicio')

  const dias = ['', 'Dia 1 (02/06)', 'Dia 2 (03/06)', 'Dia 3 (04/06)']

  let schedule = ''
  for (let d = 1; d <= 3; d++) {
    const talks = (palestras ?? []).filter((p) => p.dia_evento === d)
    if (talks.length === 0) continue
    schedule += `\n${dias[d]}:\n`
    for (const p of talks) {
      const inicio = p.horario_inicio.slice(11, 16)
      const fim = p.horario_fim.slice(11, 16)
      schedule += `  ${inicio}-${fim} — ${p.tema} (${p.palestrante}) — ${p.vagas_totais} vagas\n`
    }
  }

  return `Você é um assistente virtual do ABRAVEQ 2026 — XXVI Conferência Anual da Associação Brasileira de Médicos Veterinários de Equídeos.

Evento: 2 a 4 de Junho de 2026
Local: Estande Diagnostic Vet (patrocinador oficial)

Aqui está a grade completa de palestras:${schedule}

Regras:
- Responda APENAS sobre o evento ABRAVEQ 2026, suas palestras, inscrições e o estande Diagnostic Vet.
- Se perguntarem algo fora desse contexto, responda educadamente que você só pode ajudar com informações sobre o evento.
- Seja breve, direto e use português do Brasil.
- Se perguntarem sobre vagas disponíveis, diga que elas podem ser consultadas no site oficial.
- Não invente informações — se não souber, diga que não sabe.`
}
