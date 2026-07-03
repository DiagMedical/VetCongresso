# Changelog — Sessão Mobile + Leads + Sorteio

> Data: 30/06/2026
> Status: ✅ Tudo implementado e validado (TypeScript + ESLint sem erros)

---

## 📱 Mobile — Card View em todas as tabelas do admin

Conversão de tabelas com scroll horizontal para **card view** no mobile (abaixo de `md`). Desktop (`md:`+) continua com tabela original intacta.

| Página | Arquivo |
|--------|---------|
| Leads | `components/admin/leads-table.tsx` |
| Palestras | `app/admin/palestras/palestras-client.tsx` |
| Admins | `app/admin/admins/admins-client.tsx` |
| Sorteio | `app/admin/sorteio/sorteio-admin.tsx` |
| WhatsApp | `app/admin/whatsapp/whatsapp-config.tsx` |
| Relatórios | `app/admin/relatorios/relatorios-tabela.tsx` |
| Dashboard | `components/admin/dashboard-tabela-palestras.tsx` |

**Padrão aplicado em todas:**
- `hidden md:block` na tabela desktop
- `md:hidden` no card view mobile
- `min-h-[44px]` em todos os botões de ação mobile
- Empty states compartilhados

---

## 📱 Mobile — Ajustes de UX

| Ajuste | Arquivo |
|--------|---------|
| Safe-area-inset para iPhone notch (PWA standalone) | `app/globals.css` |
| Botão "Parar Scanner" com 44px touch target | `components/scanner.tsx` |
| QR Code do ticket responsivo (`w-full max-w-[260px] aspect-square`) | `components/qr-ticket.tsx` |
| Paginação com `min-h-[44px]` (era 36px) | `components/admin/pagination.tsx` |

---

## 🔀 Migração de Leads → Sorteio

Garantir que todos os leads de palestras estejam também na tabela `sorteio_leads`, sem duplicar.

### Arquivo: `lib/actions/sorteio.ts`
- Nova function `migrarLeadsParaSorteio()`
- Busca inscritos ativos (`confirmado` + `check-in`)
- Deduplica por email
- Verifica quem já existe no sorteio
- Insere apenas os novos (`ON CONFLICT DO NOTHING`)
- Retorna `{ migrados, ignorados, total_inscritos }`

### Arquivo: `app/admin/sorteio/sorteio-admin.tsx`
- Botão "Migrar Leads → Sorteio" (cor ciano)
- Confirma antes de executar
- Toast com resultado

### Arquivo: `lib/actions/reserva.ts`
- Auto-sync: após cada reserva, insere o lead no sorteio
- Ignora silenciosamente se já existe (erro 23505)
- Não bloqueia a reserva se o sorteio falhar

**Garantias de segurança:**
- ✅ Zero `DELETE` — só INSERT
- ✅ `email UNIQUE` no banco impede duplicação
- ✅ Idempotente — pode rodar quantas vezes quiser
- ✅ Zero impacto em reservas/check-ins/palestras

---

## ⌨️ Chips de Domínios de Email

Atalho clicável para completar o email nos formulários.

### Arquivo: `components/email-input.tsx` (NOVO)
- Componente reutilizável `<EmailInput>`
- Chips: `@gmail.com` `@hotmail.com` `@outlook.com` `@yahoo.com` `@icloud.com`
- Aparece quando há texto e ainda não tem `@`
- Some automaticamente ao detectar `@`
- `min-h-[36px]` nos chips

### Arquivo: `components/reserva-form.tsx`
- Campo de email trocado por `<EmailInput>`

### Arquivo: `app/sorteio/cadastro/cadastro-form.tsx`
- Campo de email trocado por `<EmailInput>`

---

## 📄 Documentação criada

| Arquivo | Conteúdo |
|---------|----------|
| `ajustescelular.md` | Diagnóstico mobile completo |
| `PLANO-MIGRAR-LEADS-SORTEIO.md` | Plano detalhado da migração com regras de segurança |
| `CHANGELOG-SESSAO-MOBILE-LEADS.md` | Este arquivo |

---

## ✅ Checklist de Validação

- [x] TypeScript sem erros (`tsc --noEmit`)
- [x] ESLint sem erros em todos os arquivos
- [x] Card view mobile em todas as 7 tabelas do admin
- [x] Botões de ação com 44px de touch target no mobile
- [x] Safe-area-inset para iPhone
- [x] QR Code responsivo
- [x] Migração de leads idempotente
- [x] Auto-sync ao criar reserva
- [x] Chips de email nos 2 formulários públicos

---

## 📦 Comando único para subir tudo

```bash
cd E:\Apps\VetCongresso\VetCongresso

git add -A

git commit -m "feat: mobile card views + migracao leads sorteio + chips de email

- Card view mobile em todas as tabelas do admin (Leads, Palestras, Admins, Sorteio, WhatsApp, Relatorios, Dashboard)
- Safe-area-inset para iPhone notch
- Touch targets 44px (scanner, paginacao)
- QR Code do ticket responsivo
- Migrar leads de palestras para sorteio (botao no admin + auto-sync)
- Chips de dominios de email nos formularios
- Documentacao (ajustescelular.md, PLANO-MIGRAR-LEADS-SORTEIO.md)"

git push origin master
```
