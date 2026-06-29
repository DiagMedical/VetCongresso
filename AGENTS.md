<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:opencode-session -->
## Session — 25/06/2026

### QR Code + RLS + Admin Management + Login

**Problemas resolvidos:**
- QR Code usava `QRCodeSVG` (cliente) que renderizava como texto no Vercel
- RLS policies usavam `auth.uid() IN (SELECT id FROM admins)`, mas UUID nunca inserido — writes falhavam silenciosamente
- Login precisava de múltiplos cliques (race condition com `router.refresh()`)
- Página de admins inexistente — só dava pra gerenciar via SQL
- Sem botão de excluir palestra individual
- Erros engolidos (sem try/catch nem toast)
- Recursão infinita na policy da tabela `admins`

**Soluções:**

1. **QR Code** — `qrcode.react` (SVG) → `qrcode` pkg com `toDataURL()` (server component). Gera PNG como data URL no servidor.

2. **RLS trocado para email-based** — `is_admin()` com `SECURITY DEFINER` que bypasse recursão. Script em `scripts/fix-admin-rls.sql`.

3. **Login mais estável** — `router.refresh()` removido, usa `router.replace('/admin')`.

4. **Página `/admin/admins`** — Nav (Shield), formulário (nome+email), lista com remover. Server actions: `listarAdmins`, `adicionarAdmin`, `removerAdmin`.

5. **Botão Excluir por palestra** — `Trash2` em cada linha, server action `excluirPalestra`.

6. **try/catch + toast** em todos os handlers (save, toggle, duplicar, excluir, limpar duplicatas).

7. **NEXT_PUBLIC_SITE_URL** — adicionada ao `.env.local` e configurada no Vercel.

**Arquivos alterados/novos:**
- `components/qr-compartilhe.tsx` — reescrito (qrcode pkg, server component)
- `scripts/fix-admin-rls.sql` (novo)
- `scripts/schema.sql` — policies + função is_admin()
- `scripts/apply-schema.mjs` — idem
- `app/admin/admins/page.tsx` (novo)
- `app/admin/admins/admins-client.tsx` (novo)
- `app/admin/login/page.tsx` — remove router.refresh()
- `app/admin/palestras/palestras-client.tsx` — try/catch + excluir + toast
- `lib/actions/admin.ts` — listarAdmins, adicionarAdmin, removerAdmin
- `lib/actions/palestras.ts` — excluirPalestra
- `components/admin/nav.tsx` — link Admins
- `.env.local` — NEXT_PUBLIC_SITE_URL
- `package.json` — adicionado qrcode + @types/qrcode

**Commits:**
- `594b789` — "Troca QRCodeSVG para servidor: gera QR como data URL com qrcode"
- `a8ab537` — "Fix RLS email-based + admin management + delete palestra + error handling + login fix"
- `51c679c` — "Fix infinite recursion RLS: usa SECURITY DEFINER function is_admin()"
- `be3db11` — "Atualiza AGENTS.md com fix da recursão RLS"
- `bf686e4` — "redeploy"

**⚠️ Necessário:** Rodar `scripts/fix-admin-rls.sql` no Supabase SQL Editor (substitui versões anteriores).
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 26/06/2026

### Dashboard — 3 🔴 Altas concluídos

**O que foi feito:**

1. **Tabela resumo por palestra** — `components/admin/dashboard-tabela-palestras.tsx` (novo). Exibe Tema, Palestrante, Vagas, Inscritos, Check-ins, % Ocupação com barra colorida.

2. **Ocupação em tempo real** — Gráfico de barras horizontais no `dashboard-charts.tsx` com cor dinâmica: 🟢 verde (≥80%), 🟡 primary (50-79%), 🔴 danger (<50%).

3. **Últimos leads** — `components/admin/dashboard-ultimos-leads.tsx` (novo). Tabela com os 10 leads mais recentes: Nome, Email, Palestra, Data/Hora.

**Arquivos alterados/novos:**
- `lib/actions/admin.ts` — `DashboardData.reservas_por_palestra` estendido com `palestrante`, `cancelados`, `espera`, `taxa_ocupacao`; adicionado `ultimos_leads`
- `components/admin/dashboard-charts.tsx` — novo gráfico "Ocupação por Palestra" com Cell colors
- `components/admin/dashboard-tabela-palestras.tsx` (novo)
- `components/admin/dashboard-ultimos-leads.tsx` (novo)
- `app/admin/page.tsx` — integrados os dois novos componentes
- `PLANO.md` — altas movidas para concluído
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 26/06/2026 (2)

### Dashboard — Taxa Check-in + Filtro por Data

**O que foi feito:**

1. **Taxa de check-in por palestra** — `DashboardData` e `RelatorioPalestra` agora incluem `taxa_checkin` (checkins/reservas*100). Nova coluna "% Check-in" na tabela resumo com barra colorida: 🟢 ≥70%, 🟡 40-69%, 🔴 <40%.

2. **Filtro por data no dashboard** — Seletor de abas "Todos / Dia 1 / Dia 2 / Dia 3" via `searchParams`. `getDashboardData(diaFiltro?)` filtra palestras e inscritos pelo dia do evento.

**Arquivos alterados/novos:**
- `lib/actions/admin.ts` — `getDashboardData(diaFiltro?)`, `taxa_checkin` adicionado a todos os tipos e relatórios
- `components/admin/dashboard-tabela-palestras.tsx` — coluna "% Check-in" com barra
- `components/admin/dashboard-filtro-data.tsx` (novo) — tabs de filtro
- `app/admin/page.tsx` — searchParams + DashboardFiltroData
- `PLANO.md` — itens 4 e 5 movidos para concluído
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 26/06/2026 (3)

### Leads por Dia — Gráfico de Linha

**O que foi feito:**

1. **Gráfico de linha "Leads por Dia"** — Novo card no `dashboard-charts.tsx` com `LineChart` (Recharts) mostrando tendência de leads ao longo dos dias. Exibe mensagem "Dados insuficientes" quando < 2 pontos.

**Arquivos alterados:**
- `components/admin/dashboard-charts.tsx` — import `LineChart`, `Line`, `TrendingUp`; novo card com dados de `reservas_por_dia`
- `PLANO.md` — item 6 movido para concluído
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 27/06/2026 (3)

### Checklist Pré-Congresso — Implementação

**O que foi feito:**

1. **Middleware de autenticação** — `proxy.ts` já estava no formato correto (convenção Next.js 16). Confirmado funcionando via build (`ƒ Proxy (Middleware)`).

2. **QRCode do ticket** — `qr-ticket.tsx` reescrito como server component. `QRCodeSVG` (qrcode.react) substituído por `QRCode.toDataURL()` (qrcode pkg) — gera PNG no servidor, sem risco de SSR issue no Vercel.

3. **Leads com paginação** — Adicionado `.range(0, 999)` + `{ count: 'exact' }` na query. Componente exibe aviso "exibindo apenas os 1000 mais recentes".

4. **Janela check-in ampliada** — 10 min → 30 min antes do início.

5. **Data do evento na landing** — "2 a 4 de Junho de 2026 — Estande Diagnostic Vet" em accent no hero.

6. **Palestras: `<a>` → `<Link>`** — `DiaTab` agora usa `Link` (navegação client-side, sem reload).

7. **Sorteio fallback** — `.single()` → `.maybeSingle()` com `console.warn` se palestra "Sorteio Powerbank" não existir.

8. **Email** — Decidido não implementar agora (risco para T-3 dias). Ticket na tela + WhatsApp cobre.

**Arquivos alterados/novos:**
- `proxy.ts` — mantido (já estava no formato correto)
- `components/qr-ticket.tsx` — reescrito (server component, qrcode pkg)
- `app/admin/leads/page.tsx` — range + count
- `components/admin/leads-table.tsx` — totalCount + aviso limite
- `lib/actions/admin.ts` — check-in 30min
- `app/page.tsx` — data do evento
- `app/palestras/page.tsx` — `<a>` → `<Link>`
- `lib/actions/sorteio.ts` — `.maybeSingle()` + warn
- `CHECKLIST-PRE-CONGRESSO.md` — atualizado com status
- `PLANO.md` — itens marcados como concluídos
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 27/06/2026 (2)

### Exportação PDF nos Relatórios

**O que foi feito:**

1. **`lib/export.ts`** — Nova função `exportarRelatorioPDF(containerId, filename)` que captura o container HTML com html2canvas (scale 2x, JPEG 95%) e gera PDF A4 com jsPDF. Suporte a múltiplas páginas se o conteúdo exceder uma folha.

2. **`components/admin/botao-exportar-pdf.tsx`** — Botão client component com ícone FileDown, estado de loading (Loader2 + "Exportando…"), toast de sucesso/erro. Estilo accent (cyan neon) pra destacar.

3. **`app/admin/relatorios/page.tsx`** — Botão "Exportar PDF" ao lado do título; conteúdo encapsulado em `<div id="relatorio-conteudo">` para captura.

**Arquivos alterados/novos:**
- `lib/export.ts` — adicionado `exportarRelatorioPDF()`
- `components/admin/botao-exportar-pdf.tsx` (novo)
- `app/admin/relatorios/page.tsx` — botão + wrapper id
- `package.json` — adicionado jspdf + html2canvas
- `PLANO.md` — item 8 concluído
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 27/06/2026

### Tema Indigo Neon + Plus Jakarta Sans

**O que foi feito:**

1. **Paleta de cores** — Indigo-roxo (`hsl(255, 90%, 60%)`) + Cyan elétrico como `--accent` (`hsl(180, 100%, 50%`). Background dark: `hsl(255, 25%, 7%)`, cards: `hsl(255, 18%, 12%)`.

2. **Fonte** — Geist trocado por **Plus Jakarta Sans** (`next/font/google`). Variável `--font-jakarta`.

3. **Dark mode padrão** — `defaultTheme="dark"`, `enableSystem={false}` no provider.

4. **Animações** — `glow-pulse` (classe `animate-glow`), `fade-in-up` com scale, focus-visible com glow cyan, scrollbar customizada no dark.

**Arquivos alterados:**
- `app/globals.css` — tokens HSL (indigo + cyan), novo `--accent`, keyframes, scrollbar
- `app/layout.tsx` — `Plus_Jakarta_Sans` no lugar de `Geist`
- `app/providers.tsx` — `defaultTheme="dark"`

**Commits pendentes:** `git add . && git commit -m "Tema indigo neon + Plus Jakarta Sans + dark mode"`
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 26/06/2026 (4)

### Ranking de Palestrantes

**O que foi feito:**

1. **Ranking de palestrantes** — Agrega `reservas_por_palestra` por palestrante, ordena por total de inscritos decrescente. Exibe tabela com #, Nome, Inscritos, Check-ins.

**Arquivos alterados:**
- `lib/actions/admin.ts` — `ranking_palestrantes` adicionado ao `DashboardData` (aggregation + sort)
- `components/admin/dashboard-charts.tsx` — novo card "Ranking de Palestrantes" com tabela
- `PLANO.md` — item 7 movido para concluído
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 27/06/2026 (4)

### Admin Mobile Responsivo + PWA

**Problemas resolvidos:**

1. **Admin sem responsividade mobile** — Sidebar fixa de 224px ocupava espaço horizontal, impossível de usar em celular. Header sem hamburger para abrir navegação.

2. **Sem PWA** — `manifest.json` ausente, sem `theme-color`, sem suporte a "Add to Home Screen".

**Soluções:**

1. **Mobile Nav via Sheet** — `AdminMobileNav` com Sheet (base-ui drawer lateral esquerda) + hamburger visível apenas em `lg:hidden`. `NavLinks` extraído para componente reutilizável dentro do mesmo arquivo.

2. **Layout responsivo** — `AdminNav` recebe `className="hidden lg:flex"` no layout. Padding do main-content ajustado para `p-4 md:p-6`.

3. **Header com hamburger** — `AdminMobileNav` posicionado à esquerda antes do link "Site".

4. **PWA** — `manifest.json` com nome "ABRAVEQ 2026 — VetCongresso", `theme-color` #0d0a1a, ícone SVG inline (círculo indigo + rosto cyan). Meta tags `apple-mobile-web-app-capable` e `apple-mobile-web-app-status-bar-style` adicionadas.

**Arquivos alterados/novos:**
- `components/admin/nav.tsx` — AdminNav aceita className, NavLinks reutilizável, AdminMobileNav com Sheet
- `components/admin/header.tsx` — AdminMobileNav + hamburger
- `app/admin/layout.tsx` — sidebar `hidden lg:flex`, padding responsivo
- `public/manifest.json` (novo)
- `public/icon.svg` (novo)
- `app/layout.tsx` — manifest + theme-color + apple meta tags
- `PLANO.md` — último deploy consolidado

**Commits:**
- `4f4bb8a` — "Admin mobile responsivo + PWA (Sheet drawer, hamburger, manifest, theme-color)"
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 27/06/2026 (5)

### Revisão Final + Ajustes Pós-evento

**O que foi feito:**

1. **Sheet fecha ao clicar no link** — `MobileNavLinks` com `SheetClose` wrapping cada link. Menu mobile fecha automático na navegação.

2. **Ícone PWA PNG** — Gerados `icon-192.png` e `icon-512.png` via sharp do SVG do cavalo. Adicionado `apple-touch-icon` e `favicon.png`. Manifest com PNG + SVG + `purpose: maskable`.

3. **Backup do banco** — `scripts/backup.mjs` exporta 6 tabelas para JSON via Supabase service_role key. Salvo em `backups/` (gitignorado).

4. **Testes** — `formatPhone()` (whatsapp/client.ts, 6 casos) + `getEmailConfig()` (email/config.ts, 3 casos). Script `test:watch`. Total: 29 testes passando.

5. **Seed data alinhado** — `apply-schema.mjs` atualizado com tabelas faltantes (`mensagens_enviadas`, `configuracoes`, `sorteio_leads`), índices, RLS, admin seed. 100% alinhado com `schema.sql`.

**Arquivos alterados/novos:**
- `components/admin/nav.tsx` — MobileNavLinks com SheetClose
- `package.json` — script test:watch
- `lib/whatsapp/client.ts` — export formatPhone
- `public/icon-192.png` (novo)
- `public/icon-512.png` (novo)
- `public/favicon.png` (novo)
- `public/manifest.json` — PNG + maskable
- `app/layout.tsx` — icons (apple-touch-icon, favicon)
- `scripts/backup.mjs` (novo)
- `scripts/apply-schema.mjs` — alinhado com schema.sql
- `.gitignore` — +/backups/
- `.env.example` — +SUPABASE_SERVICE_ROLE_KEY
- `.env.local` — +SUPABASE_SERVICE_ROLE_KEY
- `lib/__tests__/whatsapp-client.test.ts` (novo)
- `lib/__tests__/email-config.test.ts` (novo)
- `PLANO.md` — sprint final consolidado

**Commits:**
- `1ff3054` — "Sheet fecha ao clicar em link no mobile nav"
- `af1a735` — "Ícone PWA: cavalo + Diagnostic Vet (SVG)"
- `799db6d` — "PWA: PNG icons (192+512), apple-touch-icon, favicon, manifest completo"
- `e45b922` — "Backup script: scripts/backup.mjs + SUPABASE_SERVICE_ROLE_KEY"
- `ce6767e` — "Fix backup: order por coluna correta"
- `c5fb852` — "Testes: formatPhone() + getEmailConfig() + test:watch"
- `8a929a7` — "Atualiza PLANO.md com backup e testes concluídos"
- `d152280` — "Alinha apply-schema.mjs com schema.sql"
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 27/06/2026 (6)

### UI Glow + Skeleton + Tabelas Ordenáveis

**O que foi feito:**

1. **Hover glow nos cards** — `components/ui/card.tsx` ganhou `hover:ring-accent/30` + `shadow-[0_0_10px_hsl(var(--accent)/0.08)]`. Todos os cards do sistema brilham em cyan ao passar o mouse.

2. **KPI pulsante** — "Total de Leads" no dashboard ganhou `animate-glow` (pulso 3s infinito). Demais KPIs com hover glow sutil.

3. **Nav admin com brilho** — Link ativo tem `shadow-[0_0_6px_hsl(var(--primary)/0.4)]`. Link inativo ganhou `hover:ring-1 hover:ring-foreground/5`.

4. **Botões CTA na landing** — "Palestras" e "Sorteio" com `hover:shadow-[0_0_10px_hsl(var(--primary)/0.25)]`.

5. **Linhas de tabela com ring** — `hover:ring-1 hover:ring-accent/10` nas tabelas do dashboard e leads.

6. **Skeleton loading** — `app/admin/loading.tsx` reescrito com layout real (KPIs, gráficos, tabela) em vez de spinner simples.

7. **Tabelas ordenáveis** — Leads (Nome, Email, Status, Origem, Data) e Dashboard (Palestra, Palestrante, Vagas, Inscritos, Check-ins, %). Clique no header alterna asc/desc com ícone de seta.

**Arquivos alterados/novos:**
- `components/ui/card.tsx` — hover ring-accent + shadow glow
- `components/admin/animated-kpi.tsx` — className prop, hover glow
- `components/admin/nav.tsx` — glow no link ativo, ring no hover
- `app/admin/page.tsx` — animate-glow no primeiro KPI
- `app/page.tsx` — hover shadow nos CTA buttons
- `components/admin/dashboard-tabela-palestras.tsx` — ordenável + hover ring
- `components/admin/dashboard-ultimos-leads.tsx` — hover ring
- `app/admin/loading.tsx` — skeleton com layout real
- `components/admin/leads-table.tsx` — ordenável (Nome, Email, Status, Origem, Data)
- `PLANO.md` — atualizado

**Commits:**
- `b119572` — "UI: glow hover nos cards, nav ativo com brilho, CTA com shadow, tabelas com ring, KPI pulsante"
- `eb4eac9` — "Skeleton loading real + tabelas ordenáveis (leads e dashboard)"
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 27/06/2026 (7)

### Loading Skeletons + Empty States + Overflow Fix + Tooltip

**O que foi feito:**

1. **Loading skeletons para 8 rotas** — `loading.tsx` adicionado em leads, palestras, sorteio, relatorios, analytics, admins, whatsapp, config. Cada um com layout skeleton específico (não genérico).

2. **Empty states** — `RelatoriosTabela` e `DashboardTabelaPalestras` agora exibem ícone + mensagem quando não há dados, em vez de tabela vazia.

3. **Overflow fix** — `palestras-client.tsx` trocado de `overflow-hidden` para `overflow-x-auto`, permitindo scroll horizontal em mobile.

4. **Tooltip no Sortear** — Botão "Sortear" exibe `title` explicativo quando desabilitado por falta de leads.

**Arquivos alterados/novos:**
- `app/admin/leads/loading.tsx` (novo)
- `app/admin/palestras/loading.tsx` (novo)
- `app/admin/palestras/palestras-client.tsx` — overflow-x-auto
- `app/admin/sorteio/loading.tsx` (novo)
- `app/admin/sorteio/sorteio-admin.tsx` — title no botão + role="status"
- `app/admin/relatorios/loading.tsx` (novo)
- `app/admin/relatorios/relatorios-tabela.tsx` — empty state
- `app/admin/analytics/loading.tsx` (novo)
- `app/admin/admins/loading.tsx` (novo)
- `app/admin/whatsapp/loading.tsx` (novo)
- `app/admin/config/loading.tsx` (novo)
- `components/admin/dashboard-tabela-palestras.tsx` — empty state
- `components/admin/dashboard-ultimos-leads.tsx` — role="status"

**Commits:**
- `1187702` — "Loading skeletons para 8 rotas + empty states + overflow-x-auto + tooltip sorteio"
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 27/06/2026 (8)

### Chatbot FAQ — Groq + Vercel AI SDK v7

**O que foi feito:**

1. **Chatbot com IA** — FAB flutuante (canto inferior direito) com glow pulsante cyan. Abre Sheet lateral com chat. Usa Groq (Llama 3.3 70B) gratuito com streaming via Vercel AI SDK v7.

2. **Contexto automático** — `lib/ai/context.ts` busca palestras ativas no banco e monta o system prompt com grade horária completa (Dia 1/2/3, horários, palestrantes, vagas).

3. **API route** — `app/api/chat/route.ts` com `streamText()` + `toTextStreamResponse()`.

4. **Visível em todas as páginas** — `<ChatFab />` incluído no root layout.

**Arquivos alterados/novos:**
- `lib/ai/context.ts` (novo)
- `app/api/chat/route.ts` (novo)
- `components/chat-fab.tsx` (novo)
- `app/layout.tsx` — import + `<ChatFab />`
- `package.json` — adicionado `ai`, `@ai-sdk/groq`, `@ai-sdk/react`
- `.env.local` — `GROQ_API_KEY=`

**⚠️ Necessário:** Criar chave em https://console.groq.com, colar no `.env.local` e adicionar `GROQ_API_KEY` no Vercel.

**Fix:** `toTextStreamResponse()` → `toUIMessageStreamResponse()`. O `useChat` do SDK v7 espera o formato data stream, não texto puro. Botão não aparecia antes desse fix.

**Fix 2 (chat não respondia):** v7 mudou `system` → `instructions` e exige `convertToModelMessages()`. Adicionado `DefaultChatTransport` no `useChat` do cliente. Mensagem de erro visível na UI quando falha.

---

### Export XLSX + Adicionar ao Calendário

**O que foi feito:**

1. **`lib/calendar.ts`** — Funções `buildGoogleCalendarUrl()` e `buildAppleCalendarUrl()` extraídas do `qr-ticket.tsx` para lib compartilhada.

2. **Botões de calendário em 3 lugares:**
   - `/palestras` — cada card de palestra tem ícone Google + Apple
   - `/admin/palestras` — cada linha da tabela tem ícone Google + Apple
   - `/ticket/[id]` — já existia, agora importa da lib

3. **`BotaoExportarXLSX`** — Componente reutilizável (mesmo padrão do `BotaoExportarPDF`), com loading + toast.

4. **XLSX nos relatórios** — Botão ao lado do PDF, exporta dados de `por_palestra` (tema, palestrante, vagas, reservas, check-ins, %).

5. **Leads** — Já tinha export XLSX + CSV na tabela, nada a fazer.

**Arquivos alterados/novos:**
- `lib/calendar.ts` (novo)
- `components/admin/botao-exportar-xlsx.tsx` (novo)
- `components/qr-ticket.tsx` — importa da lib em vez de funções inline
- `components/palestra-card.tsx` — botões Google + Apple
- `app/admin/palestras/palestras-client.tsx` — botões Google + Apple na tabela
- `app/admin/relatorios/page.tsx` — botão XLSX + dados mapeados
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 28/06/2026

### Scanner com Beep + Check-in Manual

**O que foi feito:**

1. **Beep no scanner** — `AudioContext` + `OscillatorNode` (tom 1200Hz, 150ms) tocado após check-in bem-sucedido. Sem dependências externas.

2. **`realizarCheckInAdmin()`** — Nova server action em `lib/actions/admin.ts` sem validação de horário (admin é confiável, check-in manual é fallback).

3. **Página `/admin/scanner/manual`** — Dropdown de palestra + busca por nome/email + tabela com check-in individual e em lote (selecionar múltiplos com checkbox). Reutiliza `listarInscritos()` e `realizarCheckInAdmin()`.

**Arquivos alterados/novos:**
- `app/admin/scanner/page.tsx` — beep() + chamada no doCheckin
- `lib/actions/admin.ts` — nova função realizarCheckInAdmin
- `app/admin/scanner/manual/page.tsx` (novo)
- `app/admin/scanner/manual/manual-client.tsx` (novo)
- `components/admin/nav.tsx` — link "Check-in Manual" com ícone UserCheck
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 28/06/2026 (2)

### Certificado Digital — Admin

**O que foi feito:**

1. **`listarCertificados()`** — Nova server action em `lib/actions/admin.ts` que busca todos inscritos com status `check-in`, com join da palestra. Retorna `CertificadoData[]` com nome, email, palestra, palestrante, dia, horários, checkin_at.

2. **`lib/utils.ts`** — Adicionado `formatDuracao(inicio, fim)` (ex: "1h30min") e `formatDateShort(date)` (ex: "2 de junho de 2026").

3. **Página `/admin/certificados`** — Server component que chama `listarCertificados()` e renderiza o client component.

4. **`certificados-client.tsx`** — Tabela com busca (nome/email/palestra), Dialog com preview visual do certificado (logos ABRAVEQ + Diagnostic Vet, texto formal com nome, palestra, palestrante, data, carga horária) e botão "Download PDF" que gera via html2canvas (scale 3x) + jsPDF (A4 paisagem). Loading state no botão.

5. **`loading.tsx`** — Skeleton com layout de tabela real.

6. **Nav** — Link "Certificados" com ícone `Award` entre "Check-in Manual" e "Admins".

**Arquivos alterados/novos:**
- `lib/actions/admin.ts` — `listarCertificados()`, tipo `CertificadoData`
- `lib/utils.ts` — `formatDuracao()`, `formatDateShort()`
- `app/admin/certificados/page.tsx` (novo)
- `app/admin/certificados/certificados-client.tsx` (novo)
- `app/admin/certificados/loading.tsx` (novo)
- `components/admin/nav.tsx` — link Certificados
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 28/06/2026 (3)

### Revisão Pré-Evento — Correções de Estabilidade

**Problemas resolvidos:**

1. **Server components sem try/catch** — Dashboard, Palestras, Reserva, Leads, Admins, Certificados, Sorteio, Relatórios, Analytics e Check-in manual engoliam erro e davam 500. Agora tratam com fallback amigável.

2. **QRCode.toDataURL() sem catch** — `qr-ticket.tsx` e `qr-compartilhe.tsx` podiam quebrar a página se a geração do QR falhasse. Agora com try/catch e fallback null.

3. **Logout sem catch** — `handleLogout` no `header.tsx` sem try/catch. Adicionado com toast de erro.

4. **AudioContext vazando memória** — `beep()` no scanner criava AudioContext sem fechar. Adicionado `osc.onended = () => ctx.close()`.

5. **Filtro do sorteio era no-op** — `!l.nome.includes('@') || l.nome.trim().length > 0` sempre true. Substituído por filtro real que exclui emails de teste.

6. **Error boundaries** — Criado `app/admin/error.tsx` com mensagem amigável sem expor detalhes técnicos.

7. **Acessibilidade** — `aria-label` adicionado nos links de calendário (Google + Apple) em `qr-ticket.tsx` e `palestra-card.tsx`.

8. **`new Date(null)` crash** — Verificação adicionada em `admins-client.tsx` antes de formatar data.

9. **`console.log(email)` no login** — Removido (vazava email do admin no console).

10. **`limparPalestrasDuplicadas` frágil** — Agora requer confirmação explícita (`'CONFIRMAR'`) e usa lógica baseada em tema duplicado em vez de mês.

**Arquivos alterados:**
- `app/admin/page.tsx` — try/catch + tipos explícitos
- `app/palestras/page.tsx` — try/catch
- `app/reserva/[id]/page.tsx` — try/catch
- `app/admin/scanner/manual/page.tsx` — try/catch
- `app/admin/palestras/page.tsx` — try/catch
- `app/admin/leads/page.tsx` — try/catch
- `app/admin/admins/page.tsx` — try/catch
- `app/admin/certificados/page.tsx` — try/catch
- `app/admin/sorteio/page.tsx` — try/catch
- `app/admin/relatorios/page.tsx` — try/catch
- `app/admin/analytics/page.tsx` — try/catch
- `components/qr-ticket.tsx` — try/catch QR + aria-label
- `components/qr-compartilhe.tsx` — try/catch QR + alt fixo
- `components/admin/header.tsx` — try/catch logout + toast
- `app/admin/scanner/page.tsx` — AudioContext close
- `app/admin/sorteio/sorteio-admin.tsx` — filtro corrigido + catch export
- `app/admin/admins/admins-client.tsx` — null check created_at
- `app/admin/login/page.tsx` — remove console.log
- `lib/actions/admin.ts` — `limparPalestrasDuplicadas` com confirmação + lógica por tema
- `app/admin/error.tsx` (novo) — error boundary admin
- `components/palestra-card.tsx` — aria-label calendário

**Commits:**
- `3cd76e7` — "Revisão pré-evento: try/catch em server components, QR, logout, AudioContext, filtro sorteio, error boundaries, aria-label, null checks, console.log removido"
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 28/06/2026 (4)

### Últimos Ajustes — global-error + Chatbot

**Problemas resolvidos:**

1. **`global-error.tsx`** — Criado fallback para erro no root layout. Se o layout inteiro quebrar, exibe mensagem amigável com botão "Tentar novamente" em vez de tela branca.

2. **Chatbot: close button sem ícone** — `<X>` estava como child do `SheetClose`, mas o `render` prop substitui o elemento. Movido o ícone para dentro do `render` prop.

3. **Chatbot vazava "GROQ_API_KEY"** — Mensagem de erro alterada para "Assistente temporariamente indisponível. Tente novamente mais tarde."

**Arquivos alterados/novos:**
- `app/global-error.tsx` (novo)
- `components/chat-fab.tsx` — X dentro do render prop + mensagem genérica

**Commits:**
- `4414383` — "global-error.tsx + chatbot fix (render prop X + mensagem de erro)"

### Melhorias IA — Chips de Perguntas + Resumo do Dia

**O que foi feito:**

1. **Chips de perguntas no chatbot** — Quando o chat está vazio, exibe 4 botões com perguntas frequentes ("Quais os horários?", "Como faço para reservar?", etc.). Ao clicar, envia a pergunta automaticamente.

2. **Resumo IA do Dashboard** — Card "Resumo do Dia" com texto gerado por Groq (Llama 3.3 70B) analisando KPIs reais: total de leads, check-ins, palestras mais concorridas, etc. Botão de atualizar com loading state.

**Arquivos alterados/novos:**
- `components/chat-fab.tsx` — array `PERGUNTAS_SUGERIDAS`, chips com `handleSuggestion`
- `lib/actions/admin.ts` — nova função `gerarResumoDashboard()` com `generateText` + Groq
- `components/admin/dashboard-resumo-ia.tsx` (novo) — card client component
- `app/admin/page.tsx` — import + `<DashboardResumoIA>`

### Segurança + Polimento — Rate Limit, robots.txt, Zod, CSP, Loading

**O que foi feito:**

1. **Rate limiting** — `lib/rate-limit.ts` com janela de 60s, max 10 requests. Aplicado em `criarReserva()` e `inscreverSorteio()`.

2. **`robots.txt`** — Bloqueia `/admin/` dos buscadores.

3. **Zod validation no sorteio** — `sorteioSchema` adicionado a `lib/schemas.ts`, validado no servidor em `inscreverSorteio()`.

4. **CSP header** — `frame-ancestors 'none'` + `form-action 'self'` no `next.config.ts`.

5. **Analytics: projeção corrigida** — de 60 dias para 4 dias (duração do evento).

6. **Rota `/login` removida** — duplicada de `/admin/login`. Eliminada.

7. **Loading states públicos** — `loading.tsx` para `/palestras`, `/sorteio`, `/sorteio/cadastro`, `/reserva/[id]`.

8. **SVGs padrão do Next removidos** — `next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`.

**Arquivos alterados/novos:**
- `lib/rate-limit.ts` (novo)
- `lib/schemas.ts` — +sorteioSchema
- `lib/actions/sorteio.ts` — Zod + rate limit
- `lib/actions/reserva.ts` — rate limit
- `lib/actions/admin.ts` — projeção 60→4 dias
- `public/robots.txt` (novo)
- `next.config.ts` — +CSP header
- `app/palestras/loading.tsx` (novo)
- `app/sorteio/loading.tsx` (novo)
- `app/sorteio/cadastro/loading.tsx` (novo)
- `app/reserva/[id]/loading.tsx` (novo)
- `app/login/page.tsx` — removido
- `public/next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg` — removidos

**Commits:**
- `672a91c` — "Melhorias IA: chips de perguntas no chatbot + resumo IA do dashboard"
- `c70e480` — "Segurança + polimento: rate limit, robots.txt, Zod sorteio, CSP, projeção 4 dias, loading públicos, /login removido, SVGs limpos"
<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 29/06/2026

### Correções + Melhorias Pré-evento

**Problemas resolvidos:**

1. **14 erros de lint** — `SetaIcon` criado dentro do render em `dashboard-tabela-palestras.tsx` e `leads-table.tsx`. Extraído para função separada fora do componente. `setState` síncrono em `useEffect` no `dashboard-resumo-ia.tsx` resolvido com `startTransition`.

2. **`as any` na query** — `lib/actions/admin.ts:64` refatorado para evitar `any`.

3. **console.log vazando dados** — `lib/whatsapp/client.ts:28` trocado para `console.debug`.

4. **16 warnings de lint** — 10 unused imports removidos, 2 `<img>` com eslint-disable (html2canvas), `_error` não destruturado em error boundaries, eslint-disable desnecessário removido do `next.config.ts`.

5. **`.env.example` desatualizado** — Adicionado `NEXT_PUBLIC_SITE_URL`, `GROQ_API_KEY`, `CRON_SECRET` com comentários.

6. **Token GitHub exposto** — Remote trocado de `https://DiagMedical:ghp_...@github.com/...` para `https://github.com/DiagMedical/VetCongresso.git`. ⚠️ Necessário revogar o token manualmente em github.com/settings/tokens.

7. **Badge "Esgotado"** — Adicionado `Badge variant="destructive"` nos cards de palestra quando `vagas <= 0`.

**Métricas finais:**
- Lint: 0 erros, 0 warnings
- Build: sucesso
- Testes: 29/29 passando

**Arquivos alterados:**
- `components/admin/dashboard-tabela-palestras.tsx` — SetaIcon extraído
- `components/admin/leads-table.tsx` — SetaIcon extraído
- `components/admin/dashboard-resumo-ia.tsx` — startTransition
- `lib/actions/admin.ts` — query sem any
- `lib/whatsapp/client.ts` — console.log → console.debug
- `components/palestra-card.tsx` — Badge Esgotado
- `app/admin/error.tsx` — unused _error removido
- `app/global-error.tsx` — unused _error removido
- `app/admin/analytics/analytics-charts.tsx` — unused imports
- `app/admin/config/config-page.tsx` — unused import
- `app/admin/login/page.tsx` — unused user var
- `app/admin/scanner/manual/manual-client.tsx` — unused XCircle
- `components/admin/adicionar-participante-dialog.tsx` — unused Plus
- `components/admin/palestra-dialog.tsx` — unused useId
- `components/palestra-card.tsx` — unused Button
- `lib/email/send.ts` — unused inicio/fim
- `next.config.ts` — unused eslint-disable
- `.env.example` — novas variáveis
- `app/admin/certificados/certificados-client.tsx` — eslint-disable img

<!-- END:opencode-session -->

<!-- BEGIN:opencode-session -->
## Session — 28/06/2026 (5)

### Ajustes Finais — vercel.json maxDuration

**O que foi feito:**

1. **`vercel.json`** — Adicionado `functions.maxDuration: 120` para o cron job `/api/cron/lembrete`, evitando timeout nas execuções.

**Arquivos alterados:**
- `vercel.json` — +functions.maxDuration

**Commits:**
- Pendente
<!-- END:opencode-session -->
