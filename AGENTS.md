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
