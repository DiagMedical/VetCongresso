# Plano de Ação — VetCongresso Silent Booking

**PRD referência:** Architect v5
**Última atualização:** 25/06/2026
**Status:** ✅ Fases P0, 1, 2, 3 concluídas. Fase 4 parcial (BI + Config Email + Sorteio + Grade Real).

---

## Setup Inicial

```bash
npm install                    # Instalar dependências (node_modules ausente)
cp .env.example .env.local     # Configurar variáveis de ambiente
```

---

## Fase P0 — Landing Page + Novo Fluxo de Navegação ✅

| # | Tarefa | Status |
|---|--------|--------|
| P0.0 | `npm install` | ✅ |
| P0.1 | Baixar logos (Diagnostic Vet PNG + ABRAVEQ SVG) | ✅ |
| P0.2 | Landing page `/` com hero, CTAs, QR Code | ✅ |
| P0.3 | Agenda movida para `/palestras` | ✅ |
| P0.4 | Rotas e links ajustados | ✅ |
| P0.5 | Componente `QrCompartilhe` com `qrcode.react` | ✅ |
| P0.6 | Fluxo completo testado | ✅ |

---

## Fase 1 — Críticos (UI Components + Logo) ✅

| # | Tarefa | Status |
|---|--------|--------|
| 1.1 | shadcn/ui (14 componentes, estilo base-nova) | ✅ |
| 1.2 | 3 dialogs migrados para `<Dialog>` | ✅ |
| 1.3 | Cards/badges migrados para shadcn | ✅ |
| 1.4 | Font fallback em `globals.css` | ✅ |

---

## Fase 2 — Qualidade de Código ✅

| # | Tarefa | Status |
|---|--------|--------|
| 2.1 | `buscarInscrito()` consumido no ticket | ✅ |
| 2.2 | `exportarLeads()` sem parâmetro ignorado | ✅ |
| 2.3 | `listarPalestras` duplicada unificada | ✅ |
| 2.4 | `document.forms[0]` → `formRef.current` | ✅ |
| 2.5 | `next.config.ts` com imagens + headers | ✅ |

---

## Fase 3 — Acessibilidade ✅

| # | Tarefa | Status |
|---|--------|--------|
| 3.1 | Scanner: foco, `aria-live`, `aria-label` | ✅ |
| 3.2 | Tabelas: `scope="col"` + `<caption>` | ✅ |
| 3.3 | Skip link como primeiro elemento focalizável | ✅ |
| 3.4 | Contraste `--muted` (38%), `--muted-foreground` (45%) | ✅ |
| 3.5 | Sonner: `aria-label`, duração 6s, limite 3 | ✅ |

---

## Fase 4 — Features Futuras

| # | Tarefa | Status | Arquivos |
|---|--------|--------|----------|
| 4.1 | `/admin/analytics` — BI dashboard | ✅ | `app/admin/analytics/`, `lib/actions/admin.ts:getAnalyticsData()` |
| 4.2 | `getAnalyticsData()` — KPIs + gráficos | ✅ | `lib/actions/admin.ts` |
| 4.3 | Exportação PDF | ⏳ Pendente | `lib/export.ts` |
| 4.4 | Email service (Resend) | ⏳ Config criada | `lib/email/config.ts`, `/admin/config` |
| 4.5 | Disparo automático de email | ⏳ Pendente | — |
| 4.6 | Config de email no admin | ✅ | `app/admin/config/` |
| 4.7 | **Sorteio Powerbank** | ✅ | `lib/actions/sorteio.ts`, `/sorteio`, `/sorteio/cadastro`, `/admin/sorteio` |
| 4.8 | Leads do sorteio integrados aos leads gerais | ✅ | `inscreverSorteio()` replica em `inscritos` com `origem='sorteio'` |
| 4.9 | Grade real de palestras VetTalks | ✅ | `scripts/schema.sql`, `scripts/migrate-palestras.sql` |
| 4.10 | Sorteador interno no admin | ✅ | `/admin/sorteio` — botão "Sortear" com modal + link externo |

---

## Estrutura de Rotas Atual

```
/                   → Landing page (hero + CTAs + QR das palestras)
/palestras          → Agenda com filtro por dia
/sorteio            → Landing do sorteio com QR pro cadastro
/sorteio/cadastro   → Formulário de inscrição no sorteio
/reserva/[id]       → Formulário de reserva de palestra
/ticket/[id]        → Ticket com QR Code
/login              → Login público (admin)
/admin              → Dashboard
/admin/analytics    → BI Analytics (gráficos + KPIs)
/admin/palestras    → CRUD de palestras
/admin/leads        → Lista de leads de palestras
/admin/scanner      → Leitor de QR Code
/admin/whatsapp     → Configuração e log do WhatsApp
/admin/sorteio      → Lista + export CSV de leads do sorteio
/admin/relatorios   → Relatórios gerenciais
/admin/config       → Configurações (email/Resend)
/admin/login        → Login admin
```

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
NEXT_PUBLIC_SITE_URL=            # URL pública (usada nos QR Codes)
ZAPI_INSTANCE=                   # (opcional) WhatsApp Z-API
ZAPI_TOKEN=                      # (opcional) WhatsApp Z-API
ZAPI_ENABLED=0                   # (opcional) 1 para ativar WhatsApp
CRON_SECRET=                     # Segredo dos endpoints cron
```

## Observações

- Projeto usa **Next.js 16.2.9** — sem breaking changes documentadas localmente
- shadcn/ui usa `@base-ui/react` (estilo "base-nova"), não `@radix-ui`
- Tabela `sorteio_leads` precisa ser criada no Supabase SQL Editor (em `scripts/schema.sql`)
- Grade real de palestras em `scripts/migrate-palestras.sql` (rodar no SQL Editor para substituir os seeds antigos)
- Leads do sorteio também são copiados para `inscritos` com `origem='sorteio'` — aparecem na lista geral de leads
- Sorteador interno em `/admin/sorteio` com botão "Sortear" que escolhe aleatoriamente um lead
- `NEXT_PUBLIC_SITE_URL` precisa ser configurada no Vercel (Settings → Environment Variables) para os QR Codes funcionarem em produção
