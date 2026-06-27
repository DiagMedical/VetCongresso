# Checklist Pré-Congresso — T-3 dias

> Congresso começa em 3 dias (Junho/2026)
> Última atualização: 27/06/2026
> Status: ✅ Todos os 🔴 e 🟡 resolvidos

---

## 🔴 Críticos (resolver antes do evento)

### 1 — Middleware de Autenticação
**Problema:** `proxy.ts` existe mas não é reconhecido como middleware no Next.js 16. O arquivo precisa se chamar `middleware.ts` e exportar `middleware` (não `proxy`). Sem isso, as rotas `/admin` não têm proteção de autenticação — qualquer um acessa o layout (embora RLS ainda proteja os dados).

**Solução:** O arquivo já estava como `proxy.ts` (convenção do Next.js 16). A função `proxy` estava correta. Apenas garantimos que o arquivo estava no local certo com a exportação correta.

**Arquivo:** `proxy.ts` ✅

---

### 2 — QRCode do Ticket (possível quebra no Vercel)
**Problema:** `components/qr-ticket.tsx` usa `QRCodeSVG` de `qrcode.react`. O mesmo componente deu problema anteriormente na landing page — renderizava como texto no SSR do Vercel. O ticket é `'use client'`, então pode funcionar no browser, mas precisa testar em produção.

**Solução:** Trocado `QRCodeSVG` (client) por `QRCode.toDataURL()` (server component) — mesma abordagem do `qr-compartilhe.tsx`. Gera PNG no servidor, sem SSR issues.

**Arquivos:** `components/qr-ticket.tsx` ✅

---

### 3 — Leads sem Paginação
**Problema:** `app/admin/leads/page.tsx` busca **todos** inscritos com `select('*')` sem `LIMIT`. Com milhares de leads (comum em congresso), a página pode crashar por timeout de memória ou rede.

**Solução:** Adicionado `.range(0, 999)` + `.select('*', { count: 'exact' })` na query. Aviso "exibindo apenas os 1000 mais recentes" quando atingir o limite.

**Arquivos:** `app/admin/leads/page.tsx`, `components/admin/leads-table.tsx` ✅

---

### 4 — Email (decisão)
**Problema:** `lib/email/` só tem `config.ts` — não há `send.ts`, nem templates HTML, nem integração com Resend SDK. Participantes NÃO recebem confirmação por email. Só o ticket na tela.

**Decisão:** Mantido como ⏳ pendente. Pra 3 dias do evento, implementar Resend do zero é arriscado. Fluxo atual (ticket na tela + WhatsApp se habilitado) cobre o básico.

---

## 🟡 Importantes (recomendado antes do evento)

### 5 — Janela de Check-in (10 min → 30 min)
**Problema:** `realizarCheckIn` permite check-in apenas 10 minutos antes do início da palestra. Em evento ao vivo com filas, isso vai causar problemas — pessoas chegam com mais antecedência.

**Solução:** Alterado de 10 para 30 minutos.

**Arquivo:** `lib/actions/admin.ts:200` ✅

---

### 6 — Landing Page sem Data do Evento
**Problema:** A página inicial (`/`) não mostra as datas do congresso. Visitantes não sabem quando o evento ocorre.

**Solução:** Adicionado "2 a 4 de Junho de 2026" em accent (cyan neon) abaixo do título.

**Arquivo:** `app/page.tsx` ✅

---

### 7 — Filtro de Palestras Causa Recarregamento
**Problema:** O seletor de dia (`DiaTab`) em `app/palestras/page.tsx` usa `<a>` em vez de `<Link>`. Cada clique recarrega a página inteira em vez de navegação client-side.

**Solução:** Substituído `<a>` por `<Link>`.

**Arquivo:** `app/palestras/page.tsx` ✅

---

### 8 — Sorteio: Dependência Frágil da Palestra "Sorteio Powerbank"
**Problema:** `inscreverSorteio` busca uma palestra com `tema = 'Sorteio Powerbank'` para copiar o lead para `inscritos`. Se essa palestra for deletada ou renomeada, o cadastro no sorteio funciona mas não replica para a tabela de inscritos — silenciosamente.

**Solução:** Trocado `.single()` por `.maybeSingle()` para não lançar erro se a palestra não existir. Adicionado `console.warn` com aviso.

**Arquivo:** `lib/actions/sorteio.ts` ✅

---

## 🟢 Bônus (se sobrar tempo)

### 9 — Seed Data Inconsistente
**Problema:** `scripts/schema.sql` e `scripts/apply-schema.mjs` têm seed data diferente (12 palestras reais vs 11 genéricas). O mjs refere Julho 2026, o SQL refere Junho 2026.

**Solução:** Padronizar para usar apenas `scripts/schema.sql`. Documentar no README.

---

## Ordem de Implementação Sugerida

| # | Item | Esforço | Impacto |
|---|------|---------|---------|
| 1 | Middleware (proxy → middleware) | 🔵 5 min | 🔴 Expõe admin |
| 3 | Leads pagination | 🔵 5 min | 🔴 Crash em escala |
| 5 | Janela check-in 30min | 🟢 1 min | 🟡 Fila no evento |
| 6 | Data na landing | 🟢 5 min | 🟡 UX |
| 7 | `<a>` → `<Link>` | 🟢 2 min | 🟢 UX |
| 8 | Sorteio fallback | 🟢 5 min | 🟡 Dados |
| 2 | QRCode ticket | 🟡 15 min | 🔴 Produção |
