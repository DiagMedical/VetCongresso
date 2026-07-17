# 🏗️ Plano de Transformação: VetCongresso → DiagnosticCRM

## Contexto

O VetCongresso foi construído como um app de reservas para o congresso ABRAVEQ 2026 (evento já realizado). Agora a necessidade é transformá-lo em um **CRM SaaS completo** chamado **DiagnosticCRM**, atendendo tanto área veterinária quanto humana. Sem multi-tenancy por enquanto — uma única organização.

O que já existe e será reaproveitado:
- Admin layout com sidebar + header responsivo
- Tabela de leads com busca, filtros, ordenação, paginação e exportação
- Gestão de vendedores (chips de seleção)
- Dashboard com KPIs animados, gráficos (Recharts) e resumo IA
- WhatsApp integrado (Z-API) com templates e auditoria
- Email configurado (Resend — aguardando ativação DNS)
- Autenticação Supabase + middleware de proteção
- Sistema de rate limiting
- Páginas de analytics e relatórios com exportação PDF/XLSX
- Componentes shadcn/ui padronizados

---

## Fase 1 — Novo Schema de Dados (CRM)

### 1.1 Migração do Banco

Criar nova migração SQL (`scripts/crm-schema.sql`) com as tabelas:

```sql
-- CONTATOS (generalizado de inscritos + sorteio_leads)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  origem TEXT DEFAULT 'manual',
  vendedor TEXT DEFAULT '',
  observacoes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PIPELINE STAGES (configurável pelo admin)
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ordem INT NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  probabilidade INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEALS (oportunidades)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) DEFAULT 0,
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
  vendedor TEXT DEFAULT '',
  descricao TEXT,
  data_fechamento TIMESTAMPTZ,
  motivo_perda TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATIVIDADES (histórico de interações)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('nota', 'call', 'email', 'whatsapp', 'meeting', 'task')),
  descricao TEXT,
  responsavel TEXT DEFAULT '',
  data_atividade TIMESTAMPTZ DEFAULT NOW(),
  concluido BOOLEAN DEFAULT TRUE
);
```

**Arquivos alterados:**
- `scripts/crm-schema.sql` (novo)
- `scripts/schema.sql` — adicionar novas tabelas + RLS
- `scripts/apply-schema.mjs` — adicionar novas tabelas

### 1.2 Novos Tipos TypeScript

**Arquivo:** `types/index.ts` — adicionar:

```typescript
export type DealStage = 'novo_lead' | 'contatado' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido'

export interface Contact {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  origem: string
  vendedor: string | null
  observacoes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  titulo: string
  contact_id: string
  contact?: Contact
  valor: number
  stage_id: string
  stage?: PipelineStage
  vendedor: string | null
  descricao: string | null
  data_fechamento: string | null
  motivo_perda: string | null
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  nome: string
  ordem: number
  cor: string
  probabilidade: number
}

export interface Activity {
  id: string
  contact_id: string | null
  deal_id: string | null
  tipo: 'nota' | 'call' | 'email' | 'whatsapp' | 'meeting' | 'task'
  descricao: string
  responsavel: string
  data_atividade: string
  concluido: boolean
}
```

### 1.3 Novos Schemas Zod

**Arquivo:** `lib/schemas.ts` — adicionar schemas de validação para contato, deal, atividade e pipeline stage.

### 1.4 Nova Server Action: `lib/actions/crm.ts`

Criar server actions para o CRUD de:
- `listarContacts()`, `getContact(id)`, `createContact(data)`, `updateContact(id, data)`, `deleteContact(id)`
- `listarDeals(stageId?)`, `getDeal(id)`, `createDeal(data)`, `updateDeal(id, data)`, `moveDealStage(id, stageId)`, `deleteDeal(id)`
- `listarActivities(contactId?)`, `createActivity(data)`
- `listarPipelineStages()`, `createPipelineStage(data)`, `updatePipelineStage(id, data)`, `reorderStages(stages)`
- `getCrmDashboardData()` — KPIs do CRM (total contatos, deals abertos, valor pipeline, taxa conversão)

---

## Fase 2 — Navegação e Estrutura

### 2.1 Root Redirect

`app/page.tsx` — mudar de landing page para redirect para `/admin`.

### 2.2 Nova Nav do Admin

`components/admin/nav.tsx` — atualizar links:

| Ícone | Label | Rota | Observação |
|-------|-------|------|------------|
| LayoutDashboard | Dashboard | `/admin` | Mantém |
| Users | Contatos | `/admin/contacts` | Novo (substitui Leads) |
| Pipeline | Pipeline | `/admin/deals` | Novo |
| PhoneCall | Atividades | `/admin/activities` | Novo |
| ChartBar | Relatórios | `/admin/relatorios` | Mantém |
| BarChart3 | Analytics | `/admin/analytics` | Mantém |
| Settings | Configurações | `/admin/config` | Mantém |
| Shield | Admins | `/admin/admins` | Mantém |
| MessageCircle | WhatsApp | `/admin/whatsapp` | Mantém (submenu?) |

Links a REMOVER da nav:
- `Palestras` (não faz mais sentido)
- `Scanner` (específico de evento)
- `Check-in Manual`
- `Sorteio`
- `Certificados`

### 2.3 Header

`components/admin/header.tsx` — remover link "Site" (que ia pra landing page pública). Manter ThemeToggle + Logout.

---

## Fase 3 — Páginas do CRM

### 3.1 Contatos (`/admin/contacts`)

**Arquivos:**
- `app/admin/contacts/page.tsx` (server) — busca contatos
- `app/admin/contacts/loading.tsx` — skeleton
- `app/admin/contacts/contacts-client.tsx` — tabela com busca, filtros, paginação
- `app/admin/contacts/contact-dialog.tsx` — criar/editar contato

**Reaproveitar:** `leads-table.tsx` (padrão de tabela), `pagination.tsx`, `section-card.tsx`, `page-header.tsx`

**Funcionalidades:**
- Lista de contatos com busca (nome, email, telefone)
- Filtro por vendedor, origem, tags
- Colunas: Nome, Email, Telefone, Vendedor, Origem, Data, Ações
- Modal de criar/editar contato
- Excluir com confirmação
- Exportar XLSX/CSV
- Card view mobile

### 3.2 Pipeline de Vendas (`/admin/deals`)

**Arquivos:**
- `app/admin/deals/page.tsx` (server) — busca deals + stages
- `app/admin/deals/loading.tsx` — skeleton
- `app/admin/deals/deals-kanban.tsx` — quadro Kanban
- `app/admin/deals/deal-dialog.tsx` — criar/editar deal
- `app/admin/deals/deals-table.tsx` — (opcional) visão em tabela

**Funcionalidades:**
- Quadro Kanban com colunas por estágio do pipeline
- Drag and drop (ou select de estágio) para mover deals entre colunas
- Cada card mostra: título, contato, valor, vendedor
- Modal de criar/editar deal (título, contato vinculado, valor, estágio, vendedor, descrição)
- Visão em tabela como alternativa (toggle Kanban/Tabela)
- Valor total do pipeline por estágio

### 3.3 Atividades (`/admin/activities`)

**Arquivos:**
- `app/admin/activities/page.tsx` (server)
- `app/admin/activities/activities-timeline.tsx` — timeline de atividades
- `app/admin/activities/activity-dialog.tsx` — criar atividade

**Funcionalidades:**
- Timeline cronológica de atividades
- Filtro por tipo (nota, call, email, whatsapp, meeting)
- Criar notas, registrar calls, agendar tasks
- Vinculado a contatos e deals

### 3.4 Dashboard do CRM (`/admin/page.tsx`)

**Arquivos alterados:**
- `app/admin/page.tsx` — substituir getDashboardData por getCrmDashboardData
- `lib/actions/admin.ts` — adicionar getCrmDashboardData()

**KPIs:**
- Total de Contatos
- Deals Abertos
- Valor Total do Pipeline
- Taxa de Conversão
- Deals Fechados no Mês

**Gráficos (reaproveitar Recharts):**
- Pipeline Value by Stage (barra)
- Deals por Vendedor
- Lead Sources (pizza)
- Atividades Recentes

**Reaproveitar:** `animated-kpi.tsx`, `dashboard-charts.tsx`, `dashboard-resumo-ia.tsx`

---

## Fase 4 — Comunicação

### 4.1 WhatsApp (Já existe)

O módulo WhatsApp já está funcional (`lib/whatsapp/`, `app/admin/whatsapp/`). Integrar com o CRM:
- Disparo manual de WhatsApp para contatos
- Histórico de mensagens vinculado ao contato (activity type 'whatsapp')
- Templates customizáveis

**Arquivos alterados:**
- `lib/actions/crm.ts` — `sendWhatsAppToContact(contactId, message)`
- `components/admin/whatsapp-config.tsx` — adaptar para contexto CRM

### 4.2 Email (Ativar Resend)

O Resend já está configurado (`lib/email/`), aguardando ativação DNS. Para o CRM:
- Envio de email marketing
- Templates de email
- Histórico vinculado ao contato (activity type 'email')

---

## Fase 5 — Ocultação do Código Legado (Standby)

> ⚠️ **Estratégia:** NADA é apagado! As páginas antigas ficam intactas, apenas ocultas.
> Se precisar voltar alguma no futuro, é só adicionar o link na nav novamente.

### 5.1 O que muda de fato

| Ação | Detalhes |
|---|---|
| **Nav do admin** | Remover 5 links da lista em `components/admin/nav.tsx` |
| **Root redirect** | `app/page.tsx` vira um redirect para `/admin` (landing pública some) |
| **Header** | `components/admin/header.tsx` — remove link "Site" que ia pra landing |

### 5.2 Links removidos da nav (mas arquivos intactos)

| Link removido | Rota | Arquivos (intocados) |
|---|---|---|
| Palestras | `/admin/palestras` | `app/admin/palestras/` |
| Scanner | `/admin/scanner` | `app/admin/scanner/` |
| Check-in Manual | `/admin/scanner/manual` | `app/admin/scanner/manual/` |
| Sorteio | `/admin/sorteio` | `app/admin/sorteio/` |
| Certificados | `/admin/certificados` | `app/admin/certificados/` |

### 5.3 Páginas públicas que ficam órfãs (intocadas)

| Rota | Situação |
|---|---|
| `/` | Vira redirect para `/admin` |
| `/palestras` | Intacta, só sem link |
| `/reserva/[id]` | Intacta, só sem link |
| `/ticket/[id]` | Intacta, só sem link |
| `/sorteio` | Intacta, só sem link |
| `/sorteio/cadastro` | Intacta, só sem link |

### 5.4 Componentes e libs mantidos

| Arquivo | Motivo |
|---|---|
| `components/chat-fab.tsx` | Opcional (pode virar feature do CRM) |
| `components/email-input.tsx` | Útil para formulários do CRM |
| `lib/actions/reserva.ts` | Intacto (pode ter lógica reaproveitável) |
| `lib/actions/palestras.ts` | Intacto |
| `lib/actions/sorteio.ts` | Intacto |
| `lib/calendar.ts` | Intacto |
| `lib/rate-limit.ts` | Útil para API do CRM |
| `lib/email/send.ts` | Manter e adaptar |
| `lib/whatsapp/` | Canal de comunicação do CRM |
| `lib/ai/` | Opcional (IA pode ser útil no CRM) |
| `lib/actions/admin.ts` | Manter `listarAdmins`, `adicionarAdmin`, `removerAdmin`, `listarVendedores`, `getConfiguracoes`, `salvarConfiguracao` |
| `lib/export.ts` | Exportação de dados |
| `lib/supabase/` | Clientes Supabase |
| `lib/utils.ts` | Utilitários |
| `components/admin/` | Maioria dos componentes admin |
| `components/ui/` | Shadcn components |

### 5.5 Para restaurar no futuro

```bash
# Se um dia precisar de volta:
# 1. Adicionar o link de volta em components/admin/nav.tsx
# 2. Reverter app/page.tsx para a landing original (git checkout app/page.tsx)
# 3. Reverter components/admin/header.tsx (git checkout components/admin/header.tsx)
```

---

## Fase 6 — Branding

### 6.1 Atualizar Identidade Visual

- Nome: **DiagnosticCRM**
- Cores: Manter tema Indigo Neon (já é profissional)
- Logo: Atualizar se houver nova identidade
- Meta tags: Atualizar title, description
- Favicon: Manter ou atualizar

**Arquivos alterados:**
- `app/layout.tsx` — metadata (title, description)
- `public/manifest.json` — nome do app

---

## Ordem de Implementação Sugerida

```
Fase 1 (Schema + Types + Actions)
  └── Fase 2 (Nav + Redirect)
       └── Fase 3 (Páginas CRM)
            ├── 3.1 Contatos
            ├── 3.2 Pipeline
            ├── 3.3 Atividades
            └── 3.4 Dashboard
                 └── Fase 4 (Comunicação)
                      └── Fase 5 (Limpeza)
                           └── Fase 6 (Branding)
```

---

## Verificação

1. **TypeScript:** `npx tsc --noEmit` — zero erros
2. **Lint:** `npm run lint` — zero erros
3. **Build:** `npm run build` — sucesso
4. **Testes:** `npm test` — 29+ testes passando
5. **Funcional:** Login admin → Dashboard CRM com KPIs reais
6. **Funcional:** CRUD de contatos funcionando
7. **Funcional:** Pipeline Kanban com drag entre estágios
8. **Funcional:** Atividades vinculadas a contatos
9. **Funcional:** Exportação XLSX/CSV de contatos
10. **Funcional:** WhatsApp funcionando para contatos
