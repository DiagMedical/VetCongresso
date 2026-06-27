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
