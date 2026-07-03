# Plano de Ação — VetCongresso Silent Booking

**PRD referência:** Architect v5
**Última atualização:** 28/06/2026
**Status:** ✅ Todas as fases concluídas. Revisão pré-evento finalizada.

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
| 4.3 | Exportação PDF | ✅ | `lib/export.ts` |
| 4.4 | Email service (Resend) — config | ✅ | `lib/email/config.ts`, `/admin/config` |
| 4.5 | Disparo automático de email | ✅ | `lib/email/send.ts`, `lib/actions/reserva.ts` |
| 4.6 | Config de email no admin | ✅ | `app/admin/config/` |
| 4.7 | **Sorteio Powerbank** | ✅ | `lib/actions/sorteio.ts`, `/sorteio`, `/sorteio/cadastro`, `/admin/sorteio` |
| 4.8 | Leads do sorteio integrados aos leads gerais | ✅ | `inscreverSorteio()` replica em `inscritos` com `origem='sorteio'` |
| 4.9 | Grade real de palestras VetTalks | ✅ | `scripts/schema.sql`, `scripts/migrate-palestras.sql` |
| 4.10 | Sorteador interno no admin | ✅ | `/admin/sorteio` — botão "Sortear" com modal + link externo |
| 4.11 | Logos: Diagnostic Vet maior, ABRAVEQ menor | ✅ | `app/page.tsx`, `app/sorteio/page.tsx` |
| 4.12 | Navegação entre páginas | ✅ | Admin header → Site; Palestras/Sorteio header → Home + Admin |
| 4.13 | Limpar duplicatas no admin | ✅ | `lib/actions/admin.ts:limparPalestrasDuplicadas()` |
| 4.14 | RLS email-based + função is_admin() SECURITY DEFINER | ✅ | `scripts/fix-admin-rls.sql`, `scripts/schema.sql` |
| 4.15 | Página de gerenciamento de admins `/admin/admins` | ✅ | `app/admin/admins/` |
| 4.16 | Botão Excluir por palestra + try/catch + toast | ✅ | `app/admin/palestras/palestras-client.tsx`, `lib/actions/palestras.ts` |
| 4.17 | QR Code server component (qrcode pkg, data URL) | ✅ | `components/qr-compartilhe.tsx` |
| 4.18 | Login sem race condition (remove router.refresh) | ✅ | `app/admin/login/page.tsx` |

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
/admin/admins       → Gerenciar admins (add/remover)
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
- Função `is_admin()` com `SECURITY DEFINER` criada em todas as policies — bypasse recursão RLS
- Seed do primeiro admin: `wellington@diagnosticmedical.com.br`
- `NEXT_PUBLIC_SITE_URL` configurada no Vercel como `https://vet-congresso.vercel.app`
- QR Code usa `qrcode` pkg com `toDataURL()` (server component) — PNG em vez de SVG
- `scripts/fix-admin-rls.sql` contém o script completo pra rodar no Supabase SQL Editor

## Último Deploy 🚀

Tudo pronto pro evento! Último deploy consolidado no Vercel.

---

## ✅ Concluído (Sprint Final)

| # | Tarefa | Arquivos |
|---|--------|----------|
| 1 | Admin mobile responsivo (Sheet drawer, hamburger) | `components/admin/nav.tsx`, `components/admin/header.tsx`, `app/admin/layout.tsx` |
| 2 | PWA (manifest.json, theme-color, apple-mobile-web-app, ícone cavalo Diagnostic, PNGs 192+512, apple-touch-icon, favicon) | `public/manifest.json`, `public/icon.svg`, `public/icon-192.png`, `public/icon-512.png`, `public/favicon.png`, `app/layout.tsx` |
| 3 | Backup do banco (scripts/backup.mjs) | `scripts/backup.mjs`, `.env.example`, `.gitignore` |
| 4 | Testes automatizados (formatPhone, getEmailConfig, test:watch) | `lib/__tests__/whatsapp-client.test.ts`, `lib/__tests__/email-config.test.ts`, `package.json` |
| 5 | Seed data alinhado (apply-schema.mjs 100% = schema.sql) | `scripts/apply-schema.mjs` |
| 6 | UI glow hover (cards, nav, CTA, tabelas, KPI pulsante) | `components/ui/card.tsx`, `components/admin/nav.tsx`, `app/page.tsx`, `app/admin/page.tsx` |
| 7 | Skeleton loading real (dashboard) | `app/admin/loading.tsx` |
| 8 | Tabelas ordenáveis (leads + dashboard) | `components/admin/leads-table.tsx`, `components/admin/dashboard-tabela-palestras.tsx` |
| 9 | Loading skeletons para 8 rotas admin | `app/admin/*/loading.tsx` |
| 10 | Empty states (relatórios + dashboard) | `app/admin/relatorios/relatorios-tabela.tsx`, `components/admin/dashboard-tabela-palestras.tsx` |
| 11 | Overflow fix mobile (palestras) + tooltip sorteio | `app/admin/palestras/palestras-client.tsx`, `app/admin/sorteio/sorteio-admin.tsx` |

## ✅ Concluído (Sprint Chatbot + Export + Calendário + Scanner)

| # | Tarefa | Arquivos |
|---|--------|----------|
| 12 | Chatbot FAQ com IA (Groq + Llama 3.3 70B) | `lib/ai/context.ts`, `app/api/chat/route.ts`, `components/chat-fab.tsx` |
| 13 | Export XLSX nos relatórios | `components/admin/botao-exportar-xlsx.tsx`, `app/admin/relatorios/page.tsx` |
| 14 | Adicionar ao calendário (Google + Apple) | `lib/calendar.ts`, `components/palestra-card.tsx`, `app/admin/palestras/palestras-client.tsx` |
| 15 | Beep no scanner + Check-in manual | `app/admin/scanner/page.tsx`, `lib/actions/admin.ts`, `app/admin/scanner/manual/` |

## ✅ Concluído (Revisão Pré-Evento)

| # | Tarefa | Arquivos |
|---|--------|----------|
| 16 | try/catch em todos os server components (11 páginas) | `app/admin/*/page.tsx`, `app/palestras/page.tsx`, `app/reserva/[id]/page.tsx` |
| 17 | try/catch QRCode.toDataURL() (3 componentes) | `components/qr-ticket.tsx`, `components/qr-compartilhe.tsx` |
| 18 | Logout com try/catch + toast | `components/admin/header.tsx` |
| 19 | AudioContext fechado no scanner | `app/admin/scanner/page.tsx` |
| 20 | Filtro do sorteio corrigido | `app/admin/sorteio/sorteio-admin.tsx` |
| 21 | Error boundary admin | `app/admin/error.tsx` |
| 22 | aria-label nos links de calendário | `components/qr-ticket.tsx`, `components/palestra-card.tsx` |
| 23 | null check created_at | `app/admin/admins/admins-client.tsx` |
| 24 | console.log(email) removido | `app/admin/login/page.tsx` |
| 25 | limparPalestrasDuplicadas mais segura | `lib/actions/admin.ts` |
| 26 | global-error.tsx (root layout fallback) | `app/global-error.tsx` |
| 27 | Chatbot: X no render prop + msg genérica | `components/chat-fab.tsx` |
| 28 | Chips de perguntas no chatbot | `components/chat-fab.tsx` |
| 29 | Resumo IA do Dashboard | `lib/actions/admin.ts`, `components/admin/dashboard-resumo-ia.tsx`, `app/admin/page.tsx` |
| 30 | Rate limiting (reserva + sorteio) | `lib/rate-limit.ts`, `lib/actions/reserva.ts`, `lib/actions/sorteio.ts` |
| 31 | robots.txt | `public/robots.txt` |
| 32 | Zod validation sorteio | `lib/schemas.ts`, `lib/actions/sorteio.ts` |
| 33 | CSP header | `next.config.ts` |
| 34 | Analytics: projeção 60→4 dias | `lib/actions/admin.ts` |
| 35 | Rota /login removida | `app/login/page.tsx` |
| 36 | Loading states públicos (4 rotas) | `app/palestras/loading.tsx`, `app/sorteio/loading.tsx`, `app/sorteio/cadastro/loading.tsx`, `app/reserva/[id]/loading.tsx` |
| 37 | SVGs padrão removidos | `public/next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg` |
| 38 | vercel.json — maxDuration cron | `vercel.json` |

## ⏳ Pós-evento

| # | Tarefa | Notas |
|---|--------|-------|
| 1 | Email (Resend) — ativar | Precisa de acesso DNS para verificar domínio |

## ✅ Concluído (Sprint Pós-evento — Leads + Vendedor)

| # | Tarefa | Arquivos |
|---|--------|----------|
| 39 | Dedup de leads por email (inscritos > sorteio) | `app/admin/leads/page.tsx` |
| 40 | Coluna vendedor em inscritos + sorteio_leads | `scripts/add-vendedor.sql`, `scripts/schema.sql`, `scripts/apply-schema.mjs` |
| 41 | Chips de seleção de vendedor (3 formulários) | `components/reserva-form.tsx`, `app/sorteio/cadastro/cadastro-form.tsx`, `components/admin/adicionar-participante-dialog.tsx` |
| 42 | Admin > Config — gerenciar vendedores | `app/admin/config/config-page.tsx` |
| 43 | Coluna + filtro vendedor na tabela de leads | `components/admin/leads-table.tsx` |
| 44 | Export inclui vendedor | `lib/actions/admin.ts`, `lib/actions/sorteio.ts` |
| 45 | Leads table responsiva para notebook | `components/admin/leads-table.tsx` |

> 🔴 Alta = essencial pro evento, 🟡 Média = bom ter, 🟢 Baixa = legal, ⏳ Pendente = depois
