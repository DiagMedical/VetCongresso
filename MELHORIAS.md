# 🗺️ DiagnosticCRM — Plano de Melhorias

> Gerado em 17/07/2026 após auditoria geral do app.

---

## 🟡 Prioridade Média

### 1. Branding — VetCongresso → DiagnosticCRM

**Problema:** O app ainda exibe "VetCongresso" e "ABRAVEQ" em vários lugares, mesmo sendo agora DiagnosticCRM.

**Onde:** (11 arquivos)

| Arquivo | O que está | Mudar para |
|---------|-----------|------------|
| `app/admin/login/page.tsx:55` | "Admin - VetCongresso" | "Admin - DiagnosticCRM" |
| `lib/actions/admin.ts:215` | evento: 'VetCongresso 2026' | Definir via config |
| `lib/whatsapp/messages.ts` | "📍 VetCongresso 2026" | "📍 DiagnosticCRM" |
| `lib/email/templates.ts` | "ABRAVEQ 2026 — VetTalks" | "DiagnosticCRM" |
| `lib/email/config.ts` | resend_from_name padrão "ABRAVEQ 2026" | "DiagnosticCRM" |
| `lib/ai/context.ts:46` | "ABRAVEQ 2026" no contexto | Remover referência |
| `lib/calendar.ts` | "ABRAVEQ - Estande Diagnostic Vet" | "Diagnostic Vet" |
| `lib/actions/admin.ts:963` | "dashboard do ABRAVEQ 2026" no prompt | "dashboard do DiagnosticCRM" |
| `app/sorteio/page.tsx` | Logo ABRAVEQ + texto associação | Revisar se página ainda é necessária |
| `app/admin/certificados/certificados-client.tsx` | Logo ABRAVEQ + texto conferência | Decidir se mantém ABRAVEQ ou genérico |
| `components/admin/contacts-client.tsx` | Placeholder "ABRAVEQ 2026" | Placeholder genérico |

**Esforço:** Baixo — 30min de substituições.

---

### 2. Páginas Legadas — Organizar ou Remover

**Problema:** Rotas do evento ABRAVEQ original ainda existem mas não estão mais em uso ativo no CRM.

| Rota | Status | Sugestão |
|------|--------|----------|
| `/admin/leads` | Não está na nav (duplicado de `/admin/contacts`) | Esconder ou redirecionar para `/admin/contacts` |
| `/admin/palestras` | Não está na nav | Manter se ainda gerencia palestras, ou arquivar |
| `/admin/sorteio` | Não está na nav | Remover ou arquivar (não é mais CRM) |
| `/admin/scanner` | Não está na nav | Remover (era check-in do evento) |
| `/admin/scanner/manual` | Não está na nav | Remover |
| `/palestras` (público) | Página pública de palestras | Remover se não for mais evento |
| `/sorteio` (público) | Página pública de sorteio | Remover |
| `/sorteio/cadastro` | Formulário de sorteio | Remover |
| `/reserva/[id]` | Reserva de palestra | Remover |
| `/ticket/[id]` | Ticket do evento | Remover |

**Esforço:** Médio — requer decisão de negócio sobre o que manter.

---

### 3. Manutenção — Arquivos Grandes

**Problema:** Arquivos com +500 linhas ficam difíceis de manter.

| Arquivo | Linhas | Ação |
|---------|--------|------|
| `lib/actions/admin.ts` | 989 | Extrair dashboard, relatórios, whatsapp em arquivos separados |
| `lib/actions/crm.ts` | 654 | Já é só CRM, OK |
| `app/admin/contacts/contacts-client.tsx` | ~750 | Extrair ContactFormDialog, WhatsAppDialog, DuplicarDialog |

**Esforço:** Médio — refatoração sem mudança de comportamento.

---

### 4. Funcionalidades Faltantes no CRM

| Funcionalidade | Descrição |
|---------------|-----------|
| **Selecionar múltiplos leads** | Checkbox na tabela + ação em lote (atribuir vendedor, enviar WhatsApp, exportar) |
| **Filtro por data nos relatórios** | Relatórios e analytics sem filtro de período |
| **Exportar contatos da página de Leads** | Botão de exportar XLSX/CSV na página de contatos (já tem na página legada de leads) |
| **Editar deal no kanban inline** | Não precisa abrir dialog para mudar valor ou vendedor |
| **Notificações push** | Service worker instalado, mas sem push notifications |
| **Histórico completo de atividades por contato** | Timeline de atividades linkada ao contato |
| **Campo "Empresa" nos deals** | Deal não tem campo empresa (vet/humana), seria útil para relatórios |

**Esforço:** Variado.

---

### 5. Ajustes de UI/UX

| Item | Descrição | Esforço |
|------|-----------|---------|
| **Tooltips nos botões de ação** | Alguns botões ainda sem `title` (editar/excluir em deals) | Baixo |
| **Confirmação em ações destrutivas** | Deletar contact/deal usa `window.confirm()` — podia ter Dialog bonito | Baixo |
| **Ordenação na tabela de contatos** | Tabela de contatos não tem sort (ao contrário da tabela de leads) | Baixo |
| **Botão "Limpar filtros"** | Quando muitos filtros ativos, não tem um reset rápido | Baixo |
| **Toast de feedback** | Algumas ações sem toast de sucesso/erro | Baixo |
| **Skeleton "Carregando..."** | Alguns skeletons usam texto "Carregando..." em vez de layout real | Médio |

---

### 6. Dashboard — Melhorias

| Item | Descrição |
|------|-----------|
| **Gráfico de pipeline ponderado** | Gráfico de barras ou funil visual (recharts) |
| **Meta de vendas** | Configurar meta mensal e mostrar progresso |
| **Filtro por vendedor no dashboard** | Ver dashboard filtrado por vendedor |
| **Exportar dashboard como PDF** | Já tem nos relatórios, podia ter no dashboard |

---

### 7. Segurança e Config

| Item | Descrição |
|------|-----------|
| **Rate limit nas actions de CRM** | `criarReserva()` e `inscreverSorteio()` já têm, mas actions de CRM não |
| **Audit log** | Registrar quem criou/alterou cada lead/deal |
| **Permissões por admin** | Hoje qualquer admin pode tudo. Futuro: roles (admin, vendedor, viewer) |

---

### 8. Legado Técnico

| Item | Descrição |
|------|-----------|
| **`types/index.ts`** | Tem tipos legados marcados como "VetCongresso" — limpar |
| **`lib/schemas.ts`** | Schemas legados — limpar |
| **`scripts/`** | Vários scripts SQL de migração — consolidar em schema único |
| **Dependências não usadas** | Verificar `qrcode.react`, `pg`, `resend` se ainda são necessários |

---

## Resumo por Esforço

| Esforço | Itens |
|---------|-------|
| 🟢 **Baixo** (horas) | Branding (1), Tooltips/Confirmação/Ordenação (5), Tipos legados (8) |
| 🟡 **Médio** (dias) | Páginas legadas (2), Arquivos grandes (3), Filtros Dashboard (6) |
| 🔴 **Alto** (semanas) | Funcionalidades novas (4), Permissões/Audit (7) |

---

**Recomendação:** Começar pelos itens de branding (impacto visual imediato, esforço mínimo) e depois atacar as páginas legadas.
