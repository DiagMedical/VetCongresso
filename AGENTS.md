<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:opencode-session -->
## Session — 25/06/2026

### Fix RLS + Admin Management + Delete Palestra

**Problema:** RLS policies usavam `auth.uid() IN (SELECT id FROM admins)`, mas o UUID do admin nunca foi inserido na tabela `admins`. Todas as operações de write (toggle, delete, duplicatas) falhavam silenciosamente.

**Solução:**

1. **RLS trocado para email-based** — `auth.email() IN (SELECT email FROM admins)`
   - `scripts/fix-admin-rls.sql` — script pra rodar no Supabase SQL Editor
   - Policies atualizadas em `scripts/schema.sql` e `scripts/apply-schema.mjs`
   - Seed do primeiro admin: `wellington@diagnosticmedical.com.br`

2. **Login mais estável** — `router.refresh()` removido (causava race condition), usa `router.replace('/admin')`

3. **Página `/admin/admins`**:
   - Nav adicionado (ícone Shield)
   - Formulário pra adicionar admin (nome + email)
   - Lista com botão remover
   - Server actions: `listarAdmins`, `adicionarAdmin`, `removerAdmin` em `lib/actions/admin.ts`

4. **Botão Excluir por palestra** — `Trash2` em cada linha, server action `excluirPalestra` em `lib/actions/palestras.ts`

5. **try/catch + toast** em todos os handlers de palestras (save, toggle, duplicar, excluir, limpar duplicatas)

**Arquivos alterados:**
- `scripts/fix-admin-rls.sql` (novo)
- `scripts/schema.sql`
- `scripts/apply-schema.mjs`
- `app/admin/admins/page.tsx` (novo)
- `app/admin/admins/admins-client.tsx` (novo)
- `app/admin/login/page.tsx`
- `app/admin/palestras/palestras-client.tsx`
- `lib/actions/admin.ts`
- `lib/actions/palestras.ts`
- `components/admin/nav.tsx`

**Commit:** `a8ab537` — "Fix RLS email-based + admin management + delete palestra + error handling + login fix"
<!-- END:opencode-session -->
