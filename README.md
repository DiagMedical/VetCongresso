# VetCongresso — Silent Booking

Sistema de reserva silenciosa para congresso veterinário.  
Feito com Next.js 16, Supabase, Tailwind CSS v4.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Deploy:** Vercel
- **Testes:** Vitest

## Funcionalidades

### Público
- Lista de palestras com filtro por dia
- Reserva de vaga com formulário validado (Zod)
- Ticket com QR Code + links para calendário (Google/Apple)
- Lista de espera automática quando lotado

### Admin (protegido por autenticação Supabase)
- Dashboard com KPIs animados e gráficos (Recharts)
- CRUD completo de palestras
- Leitor de QR Code para check-in (jsQR)
- Gestão de leads com busca, filtros e exportação (XLSX/CSV)
- Relatórios executivos por palestra e por dia
- Liberação manual de vagas com promoção automática da lista de espera
- Configuração e auditoria de WhatsApp (Z-API)

## Pré-requisitos

- Node.js 20+
- Projeto Supabase (gratuito em [supabase.com](https://supabase.com))
- (Opcional) Conta Z-API para WhatsApp

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
| `ZAPI_INSTANCE` | ❌ | Instância Z-API (WhatsApp) |
| `ZAPI_TOKEN` | ❌ | Token Z-API |
| `ZAPI_ENABLED` | ❌ | `1` para ativar WhatsApp |

## Estrutura

```
app/              # Rotas (App Router)
├── page.tsx      # Home pública
├── reserva/[id]  # Formulário de reserva
├── ticket/[id]   # Ticket com QR Code
├── login/        # Redireciona para /admin/login
└── admin/        # Painel administrativo
components/       # Componentes React
lib/              # Lógica (server actions, schemas, utils)
├── actions/      # Server actions
├── supabase/     # Clientes Supabase
└── whatsapp/     # Integração WhatsApp
scripts/          # Scripts de banco
proxy.ts          # Auth guard (substitui middleware.ts)
```

## Deploy

```bash
# Deploy na Vercel
npx vercel --prod
```

Configure as variáveis de ambiente no dashboard da Vercel conforme tabela acima.
