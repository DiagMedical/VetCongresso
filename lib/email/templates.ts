interface InscritoData {
  nome: string
  email: string
  telefone: string
  tema: string
  palestrante: string
  dia: number
  inicio: string
  fim: string
  status: string
  ticketUrl: string
}

function baseHtml(body: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0a1a;font-family:'Plus Jakarta Sans',Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a1a">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#15102a;border-radius:12px;border:1px solid rgba(139,92,246,0.2)">
        <tr><td style="padding:32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${body}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function confirmacaoTemplate(d: InscritoData) {
  return baseHtml(`
    <tr><td style="padding-bottom:24px;text-align:center">
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">✅ Reserva Confirmada</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#8b8ca7">ABRAVEQ 2026 — VetTalks</p>
    </td></tr>
    <tr><td style="padding:16px;background:rgba(139,92,246,0.08);border-radius:8px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Palestra</p>
      <p style="margin:0;font-size:16px;color:#fff;font-weight:600">${d.tema}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#8b8ca7">Com ${d.palestrante}</p>
    </td></tr>
    <tr><td style="padding:16px 0 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:50%;padding:8px 8px 8px 0">
            <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Dia</p>
            <p style="margin:0;font-size:14px;color:#fff">Dia ${d.dia}</p>
          </td>
          <td style="width:50%;padding:8px 0 8px 8px">
            <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Horário</p>
            <p style="margin:0;font-size:14px;color:#fff">${d.inicio} — ${d.fim}</p>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px 0 0">
      <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Participante</p>
      <p style="margin:0;font-size:14px;color:#fff">${d.nome}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#8b8ca7">${d.email}</p>
    </td></tr>
    <tr><td style="padding:24px 0 0">
      <a href="${d.ticketUrl}" style="display:inline-block;padding:12px 24px;background:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Acessar Ticket</a>
      <p style="margin:12px 0 0;font-size:12px;color:#8b8ca7">Apresente o QR Code na entrada da palestra</p>
    </td></tr>
  `)
}

export function esperaTemplate(d: InscritoData) {
  return baseHtml(`
    <tr><td style="padding-bottom:24px;text-align:center">
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">⏳ Lista de Espera</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#8b8ca7">ABRAVEQ 2026 — VetTalks</p>
    </td></tr>
    <tr><td style="padding:16px;background:rgba(139,92,246,0.08);border-radius:8px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Palestra</p>
      <p style="margin:0;font-size:16px;color:#fff;font-weight:600">${d.tema}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#8b8ca7">Com ${d.palestrante}</p>
    </td></tr>
    <tr><td style="padding:16px 0">
      <p style="margin:0;font-size:13px;color:#8b8ca7;line-height:1.6">
        Você foi inserido na lista de espera. Se uma vaga for liberada, 
        avisaremos imediatamente por WhatsApp e e-mail.
      </p>
    </td></tr>
  `)
}

export function checkinTemplate(d: InscritoData) {
  return baseHtml(`
    <tr><td style="padding-bottom:24px;text-align:center">
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">🎟️ Check-in Realizado</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#8b8ca7">ABRAVEQ 2026 — VetTalks</p>
    </td></tr>
    <tr><td style="padding:16px;background:rgba(139,92,246,0.08);border-radius:8px">
      <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Palestra</p>
      <p style="margin:0;font-size:16px;color:#fff;font-weight:600">${d.tema}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#8b8ca7">Com ${d.palestrante}</p>
    </td></tr>
    <tr><td style="padding:16px 0">
      <p style="margin:0;font-size:13px;color:#8b8ca7;line-height:1.6">
        Seu check-in foi registrado com sucesso. Aproveite a palestra!
      </p>
    </td></tr>
  `)
}

export function promovidoTemplate(d: InscritoData) {
  return baseHtml(`
    <tr><td style="padding-bottom:24px;text-align:center">
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">🎉 Vaga Liberada!</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#8b8ca7">ABRAVEQ 2026 — VetTalks</p>
    </td></tr>
    <tr><td style="padding:16px;background:rgba(139,92,246,0.08);border-radius:8px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Palestra</p>
      <p style="margin:0;font-size:16px;color:#fff;font-weight:600">${d.tema}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#8b8ca7">Com ${d.palestrante}</p>
    </td></tr>
    <tr><td style="padding:16px 0">
      <p style="margin:0;font-size:13px;color:#8b8ca7;line-height:1.6">
        Sua reserva foi confirmada! Uma vaga foi liberada e você foi promovido 
        da lista de espera.
      </p>
    </td></tr>
    <tr><td style="padding:24px 0 0">
      <a href="${d.ticketUrl}" style="display:inline-block;padding:12px 24px;background:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Acessar Ticket</a>
    </td></tr>
  `)
}

export function cancelamentoTemplate(d: InscritoData) {
  return baseHtml(`
    <tr><td style="padding-bottom:24px;text-align:center">
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">❌ Reserva Cancelada</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#8b8ca7">ABRAVEQ 2026 — VetTalks</p>
    </td></tr>
    <tr><td style="padding:16px;background:rgba(139,92,246,0.08);border-radius:8px">
      <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Palestra</p>
      <p style="margin:0;font-size:16px;color:#fff;font-weight:600">${d.tema}</p>
    </td></tr>
    <tr><td style="padding:16px 0">
      <p style="margin:0;font-size:13px;color:#8b8ca7;line-height:1.6">
        Sua reserva foi cancelada devido à ausência. Se tiver dúvidas, 
        procure o estande da Diagnostic Vet.
      </p>
    </td></tr>
  `)
}

export function lembreteTemplate(d: InscritoData) {
  return baseHtml(`
    <tr><td style="padding-bottom:24px;text-align:center">
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700">⏰ Lembrete de Palestra</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#8b8ca7">ABRAVEQ 2026 — VetTalks</p>
    </td></tr>
    <tr><td style="padding:16px;background:rgba(139,92,246,0.08);border-radius:8px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Palestra</p>
      <p style="margin:0;font-size:16px;color:#fff;font-weight:600">${d.tema}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#8b8ca7">Com ${d.palestrante}</p>
    </td></tr>
    <tr><td style="padding:16px 0 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:50%;padding:8px 8px 8px 0">
            <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Dia</p>
            <p style="margin:0;font-size:14px;color:#fff">Dia ${d.dia}</p>
          </td>
          <td style="width:50%;padding:8px 0 8px 8px">
            <p style="margin:0 0 4px;font-size:12px;color:#8b8ca7">Horário</p>
            <p style="margin:0;font-size:14px;color:#fff">${d.inicio} — ${d.fim}</p>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 0 0">
      <a href="${d.ticketUrl}" style="display:inline-block;padding:12px 24px;background:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Ver Ticket</a>
    </td></tr>
  `)
}
