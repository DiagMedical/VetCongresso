# DiagnosticCRM

CRM SaaS completo para gestão de contatos, pipeline de vendas e atividades.  
Transformado a partir do VetCongresso (app de reservas do congresso ABRAVEQ 2026).  
Feito com Next.js 16, Supabase, Tailwind CSS v4.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Deploy:** Vercel
- **Testes:** Vitest

## Funcionalidades

### CRM
- **Dashboard** com KPIs (total contatos, deals abertos, valor pipeline, taxa de conversão)
- **Contatos** — CRUD completo com busca, filtros, paginação e exportação
- **Pipeline de Vendas** — Quadro Kanban com drag & drop + visão em tabela
- **Atividades** — Timeline de interações (call, email, whatsapp, meeting, nota, task)
- **Relatórios** executivos com exportação PDF/XLSX
- **Analytics** com gráficos e projeções

### Comunicação
- **WhatsApp** integrado (Z-API) com templates e auditoria
- **Email** configurado (Resend)

### Admin
- Dashboard com KPIs animados e resumo IA (Groq)
- Gestão de vendedores (chips de seleção)
- Autenticação Supabase + middleware de proteção
- Rate limiting em formulários públicos

### Legado (intacto, oculto da navegação)
- Páginas públicas de palestras, reserva, ticket e sorteio
- Scanner QR Code para check-in
- Certificados digitais

## Pré-requisitos

- Node.js 20+
- Projeto Supabase (gratuito em [supabase.com](https://supabase.com))
- (Opcional) Conta Z-API para WhatsApp
- (Opcional) Chave Groq para IA (chatbot + resumo)

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env.local

# 3. Configurar .env.local com suas credenciais Supabase
#    NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon

# 4. Aplicar schema no banco (opções):
#    a) Copiar e colar scripts/schema.sql no SQL Editor do Supabase Dashboard
#    b) Ou via script (requer DB_HOST e DB_PASSWORD):
#       DB_HOST=db.seuprojeto.supabase.co DB_PASSWORD=sua_senha node scripts/apply-schema.mjs
#    c) Schema CRM adicional:
#       node scripts/apply-crm.mjs

# 5. Rodar dev
npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Iniciar servidor de produção |
| `npm run lint` | Verificar lint (ESLint) |
| `npm test` | Rodar testes (Vitest) |

## Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave anônima do Supabase |
| `CRON_SECRET` | ✅ | Segredo para endpoint cron |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Chave service_role (backup + CRM) |
| `GROQ_API_KEY` | ❌ | Chave Groq (chatbot IA + resumo) |
| `ZAPI_INSTANCE` | ❌ | Instância Z-API (WhatsApp) |
| `ZAPI_TOKEN` | ❌ | Token Z-API |
| `ZAPI_ENABLED` | ❌ | `1` para ativar WhatsApp |

## Estrutura

```
app/                # Rotas (App Router)
├── admin/          # Painel administrativo (CRM)
│   ├── page.tsx    # Dashboard CRM
│   ├── contacts/   # CRUD de contatos
│   ├── deals/      # Pipeline Kanban
│   ├── activities/ # Timeline de atividades
│   ├── whatsapp/   # Módulo WhatsApp
│   ├── relatorios/ # Relatórios executivos
│   ├── analytics/  # Analytics e gráficos
│   ├── config/     # Configurações
│   └── admins/     # Gestão de admins
├── page.tsx        # Redirect para /admin
├── palestras/      # Legado (público)
├── reserva/[id]    # Legado
├── ticket/[id]     # Legado
└── sorteio/        # Legado
components/         # Componentes React
├── admin/          # Componentes do admin
└── ui/             # Shadcn/ui components
lib/                # Lógica (server actions, schemas, utils)
├── actions/        # Server actions
│   ├── crm.ts      # CRM (contatos, deals, atividades)
│   ├── admin.ts    # Admin (dashboard, config, vendedores)
│   ├── reserva.ts  # Legado
│   └── sorteio.ts  # Legado
├── supabase/       # Clientes Supabase
├── schemas.ts      # Zod schemas (CRM + legado)
└── whatsapp/       # Integração WhatsApp
scripts/            # Scripts de banco
├── crm-schema.sql  # Schema CRM
├── apply-crm.mjs   # Migração CRM
├── schema.sql      # Schema legado
└── apply-schema.mjs
proxy.ts            # Auth guard (substitui middleware.ts)
```

## Projetos Relacionados

- [Plano de Transformação](PLANO-TRANSFORMACAO-CRM.md) — Documento de migração VetCongresso → DiagnosticCRM

## Deploy

```bash
# Deploy na Vercel
npx vercel --prod
```

Configure as variáveis de ambiente no dashboard da Vercel conforme tabela acima.
