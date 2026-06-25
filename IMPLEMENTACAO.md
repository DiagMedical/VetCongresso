# VetCongresso — Silent Booking
## Guia de Implementação (Architect v5)

---

### 1. Stack

- **Frontend:** Next.js 16, App Router, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Deploy:** Vercel
- **Bibliotecas:** qrcode.react, jsqr, recharts, xlsx, date-fns, next-themes, lucide-react, zod

---

### 2. Estrutura do Projeto

```
vetcongresso/
├── app/
│   ├── page.tsx                    # Home pública (lista palestras)
│   ├── layout.tsx                  # Root layout (ThemeProvider, font)
│   ├── globals.css                 # Tailwind v4 + tokens tema
│   ├── not-found.tsx               # 404
│   ├── error.tsx                   # Error boundary
│   ├── loading.tsx                 # Loading global
│   ├── providers.tsx               # ThemeProvider wrapper
│   ├── reserva/
│   │   └── [id]/
│   │       └── page.tsx           # Formulário de reserva
│   ├── ticket/
│   │   └── [id]/
│   │       └── page.tsx           # Ticket com QR Code
│   ├── login/
│   │   └── page.tsx               # Admin login (movido para admin/login)
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx           # Admin login page
│   │   ├── layout.tsx             # Layout protegido
│   │   ├── page.tsx               # Dashboard (KPIs + gráficos + ações rápidas)
│   │   ├── loading.tsx
│   │   ├── scanner/
│   │   │   └── page.tsx           # Leitor QR para check-in
│   │   ├── palestras/
│   │   │   ├── page.tsx            # CRUD palestras
│   │   │   └── palestras-client.tsx # Client component (ações, tabela)
│   │   ├── leads/
│   │   │   └── page.tsx            # Gestão de leads
│   │   ├── relatorios/
│   │   │   ├── page.tsx            # Relatórios executivos
│   │   │   ├── relatorios-charts.tsx  # Gráficos Recharts
│   │   │   └── relatorios-tabela.tsx  # Tabela detalhada
│   │   └── whatsapp/
│   │       ├── page.tsx            # Config WhatsApp
│   │       └── whatsapp-config.tsx # Client component config
├── components/
│   ├── palestra-card.tsx
│   ├── qr-ticket.tsx
│   ├── theme-toggle.tsx
│   ├── scanner.tsx                # Leitor QR via câmera (jsQR)
│   ├── reserva-form.tsx
│   └── admin/
│       ├── header.tsx
│       ├── nav.tsx
│       ├── kpi-card.tsx
│       ├── dashboard-charts.tsx   # Gráficos Recharts (reservas/dia, top palestras)
│       ├── dashboard-actions.tsx  # Ações rápidas (scanner, liberar vaga, add)
│       ├── liberar-vaga-dialog.tsx
│       ├── adicionar-participante-dialog.tsx
│       ├── palestra-dialog.tsx       # Modal criar/editar palestra
│       └── leads-table.tsx           # Tabela de leads com filtros e exportação
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase browser client
│   │   └── server.ts              # Supabase server client
│   ├── whatsapp/
│   │   ├── client.ts              # Z-API WhatsApp client
│   │   ├── messages.ts            # Message templates
│   │   ├── send.ts                # Send helper (log + dispatch)
│   │   └── index.ts               # Barrel export
│   ├── actions/
│   │   ├── reserva.ts             # Server actions: reserva (listar, criar, buscar)
│   │   ├── admin.ts               # Server actions: painel admin
│   │   └── palestras.ts           # Server actions: CRUD palestras
│   ├── export.ts                  # Export XLSX / CSV
│   └── utils.ts                   # cn(), format, helpers
├── types/
│   └── index.ts                   # Domínio types
├── public/
│   └── logo.svg
├── proxy.ts                       # Auth guard /admin/* (proxy, substitui middleware.ts)
├── vercel.json                    # Cron config para lembrete
├── .env.example
├── next.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.mjs
```

---

### 3. Banco de Dados

```sql
-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela: palestras
CREATE TABLE palestras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dia_evento INT NOT NULL CHECK (dia_evento BETWEEN 1 AND 3),
    tema TEXT NOT NULL,
    palestrante TEXT NOT NULL,
    descricao TEXT,
    horario_inicio TIMESTAMPTZ NOT NULL,
    horario_fim TIMESTAMPTZ NOT NULL,
    vagas_totais INT DEFAULT 20 CHECK (vagas_totais > 0),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: inscritos
CREATE TABLE inscritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    palestra_id UUID NOT NULL REFERENCES palestras(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    status TEXT DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'check-in', 'cancelado_por_falta', 'espera')),
    origem TEXT DEFAULT 'site',
    checkin_at TIMESTAMPTZ,
    cancelado_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: admins
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- View: vagas disponiveis
CREATE VIEW vagas_disponiveis AS
SELECT
    p.id,
    p.vagas_totais - COUNT(i.id) FILTER (WHERE i.status IN ('confirmado', 'check-in')) AS vagas_restantes
FROM palestras p
LEFT JOIN inscritos i ON i.palestra_id = p.id
WHERE p.ativo = TRUE
GROUP BY p.id, p.vagas_totais;

-- Função: verificar vagas antes de inserir
CREATE OR REPLACE FUNCTION check_vagas_disponiveis()
RETURNS TRIGGER AS $$
DECLARE
    vagas_livres INT;
BEGIN
    SELECT p.vagas_totais - COUNT(i.id)
    INTO vagas_livres
    FROM palestras p
    LEFT JOIN inscritos i ON i.palestra_id = p.id AND i.status IN ('confirmado', 'check-in')
    WHERE p.id = NEW.palestra_id
    GROUP BY p.id;

    IF vagas_livres <= 0 THEN
        RAISE EXCEPTION 'Palestra lotada';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_inscritos
    BEFORE INSERT ON inscritos
    FOR EACH ROW
    EXECUTE FUNCTION check_vagas_disponiveis();

-- Row Level Security
ALTER TABLE palestras ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies públicas
CREATE POLICY "public_read_palestras" ON palestras
    FOR SELECT USING (TRUE);

CREATE POLICY "public_insert_inscritos" ON inscritos
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "public_read_inscrito" ON inscritos
    FOR SELECT USING (TRUE);

-- Policies admin (acesso via auth.uid() na tabela admins)
CREATE POLICY "admin_all_palestras" ON palestras
    FOR ALL USING (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "admin_all_inscritos" ON inscritos
    FOR ALL USING (auth.uid() IN (SELECT id FROM admins));

-- Tabela: mensagens_enviadas (auditoria WhatsApp)
CREATE TABLE IF NOT EXISTS mensagens_enviadas (
    (
    (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscrito_id UUID REFERENCES inscritos(id) ON DELETE SET NULL,
    telefone TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('confirmacao', 'espera', 'checkin', 'promovido', 'lembrete', 'cancelamento', 'manual')),
    mensagem TEXT NOT NULL,
    sucesso BOOLEAN DEFAULT FALSE,
    zaap_id TEXT,
    erro TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: configuracoes (admin UI)
CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice RN04: impedir reserva duplicada por email+palestra
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation
ON inscritos (email, palestra_id)
WHERE status IN ('confirmado', 'check-in', 'espera');

-- Coluna lembrete_enviado para controle de disparo
ALTER TABLE inscritos ADD COLUMN IF NOT EXISTS lembrete_enviado BOOLEAN DEFAULT FALSE;

-- RLS mensagens_enviadas
ALTER TABLE mensagens_enviadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_mensagens" ON mensagens_enviadas;
CREATE POLICY "admin_all_mensagens" ON mensagens_enviadas
    FOR ALL USING (auth.uid() IN (SELECT id FROM admins));

DROP POLICY IF EXISTS "service_insert_mensagens" ON mensagens_enviadas;
CREATE POLICY "service_insert_mensagens" ON mensagens_enviadas
    FOR INSERT WITH CHECK (TRUE);

-- RLS configuracoes
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_configuracoes" ON configuracoes;
CREATE POLICY "admin_all_configuracoes" ON configuracoes
    FOR ALL USING (auth.uid() IN (SELECT id FROM admins));

-- Fix trigger: permitir INSERT com status 'espera' mesmo se lotado
CREATE OR REPLACE FUNCTION check_vagas_disponiveis()
RETURNS TRIGGER AS $$
DECLARE
    vagas_livres INT;
BEGIN
    SELECT p.vagas_totais - COUNT(i.id)
    INTO vagas_livres
    FROM palestras p
    LEFT JOIN inscritos i ON i.palestra_id = p.id AND i.status IN ('confirmado', 'check-in')
    WHERE p.id = NEW.palestra_id
    GROUP BY p.id;

    IF vagas_livres <= 0 AND NEW.status IS DISTINCT FROM 'espera' THEN
        RAISE EXCEPTION 'Palestra lotada';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 4. Tipos TypeScript

```ts
export type StatusInscricao = 'confirmado' | 'check-in' | 'cancelado_por_falta' | 'espera'
export type OrigemInscricao = 'site' | 'manual'
export type DiaEvento = 1 | 2 | 3

export interface Palestra {
  id: string
  dia_evento: DiaEvento
  tema: string
  palestrante: string
  descricao: string | null
  horario_inicio: string
  horario_fim: string
  vagas_totais: number
  vagas_restantes?: number
  ativo: boolean
  created_at: string
}

export interface Inscrito {
  id: string
  palestra_id: string
  nome: string
  email: string
  telefone: string
  status: StatusInscricao
  origem: OrigemInscricao
  checkin_at: string | null
  cancelado_at: string | null
  created_at: string
  palestra?: Palestra
}

export interface Admin {
  id: string
  nome: string
  email: string
  created_at: string
}

export interface PalestraFormData {
  dia_evento: DiaEvento
  tema: string
  palestrante: string
  descricao?: string
  horario_inicio: string
  horario_fim: string
  vagas_totais: number
}

export interface ReservaFormData {
  palestra_id: string
  nome: string
  email: string
  telefone: string
  aceite_lgpd: boolean
}
```

---

### 5. Componentes Shadcn Necessários

```bash
npx shadcn@latest add button card badge dialog table tabs toast
npx shadcn@latest add dropdown-menu input form label select
npx shadcn@latest add sheet separator skeleton avatar
```

---

### 6. Fluxo de Dados

#### Reserva
1. Usuário acessa `/` → lista palestras com vagas
2. Clica "Reservar" → `/reserva/[palestra_id]`
3. Preenche formulário → server action `criarReserva()`
4. Trigger `check_vagas_disponiveis` valida no banco (anti-overbooking)
5. Sucesso → redirect `/ticket/[inscrito_id]`
6. Erro (lotado) → toast + feedback

#### Check-in (Admin)
1. Admin abre `/admin/scanner`
2. Câmera lê QR (contém `inscrito_id`)
3. Server action `realizarCheckIn(inscrito_id)`
4. Valida: status === 'confirmado' (não pode reusar QR)
5. `UPDATE status = 'check-in', checkin_at = NOW()`
6. Feedback visual (sucesso/erro)

#### Liberar Vaga (Admin)
1. Dashboard → botão "Liberar vaga" no card da palestra
2. Abre dialog listando inscritos `confirmado` sem check-in
3. Confirma → server action `cancelarPorFalta(inscrito_id)`
4. `UPDATE status = 'cancelado_por_falta', cancelado_at = NOW()`

---

### 7. Tema (next-themes)

**Tokens CSS** (`app/globals.css`):
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --card: 210 40% 96%;
    --primary: 213 100% 36%;
    --success: 160 100% 33%;
    --danger: 0 84% 60%;
    --text: 0 0% 0%;
  }
  .dark {
    --background: 222 47% 11%;
    --card: 215 28% 17%;
    --primary: 217 91% 60%;
    --success: 160 100% 33%;
    --danger: 0 84% 60%;
    --text: 210 40% 96%;
  }
}
```

---

### 8. Seed Data (Placeholder — 11 palestras)

```
Dia 1:
  09:00-10:00 | Anestesia em Pequenos Animais     | Dr. Silva
  10:30-11:30 | Ortopedia Veterinária             | Dr. Santos
  14:00-15:00 | Dermatologia Canina               | Dra. Oliveira

Dia 2:
  09:00-10:00 | Cardiologia Felina                | Dr. Souza
  10:30-11:30 | Oncologia Veterinária             | Dr. Costa
  13:00-14:00 | Medicina Felina                   | Dra. Pereira
  14:30-15:30 | Cirurgia de Tecidos Moles         | Dr. Lima
  16:00-17:00 | Diagnóstico por Imagem            | Dra. Almeida

Dia 3:
  09:00-10:00 | Neurologia Veterinária            | Dr. Martins
  10:30-11:30 | Endocrinologia                     | Dra. Barbosa
  14:00-15:00 | Emergência e Cuidados Intensivos  | Dr. Rocha
```

---

### 9. APIs (Server Actions)

| Action | Status | Arquivo | Descrição |
|--------|--------|---------|-----------|
| `listarPalestras()` | ✅ | `lib/actions/reserva.ts` | Lista palestras ativas com vagas |
| `criarReserva(data)` | ✅ | `lib/actions/reserva.ts` | Cria inscrição com validação |
| `buscarInscrito(id)` | ✅ | `lib/actions/reserva.ts` | Busca inscrito + palestra para ticket |
| `realizarCheckIn(id)` | ✅ | `lib/actions/admin.ts` | Marca check-in (validação status) |
| `cancelarPorFalta(id)` | ✅ | `lib/actions/admin.ts` | Cancela por falta |
| `adicionarParticipante(data)` | ✅ | `lib/actions/admin.ts` | Cadastro manual (origem=manual) |
| `listarInscritos(palestra_id?)` | ✅ | `lib/actions/admin.ts` | Lista inscritos com join palestra |
| `getDashboardData()` | ✅ | `lib/actions/admin.ts` | KPIs + dados para gráficos |
| `listarPalestrasComVagas()` | ✅ | `lib/actions/admin.ts` | Palestras ativas com vagas |
| `listarPalestrasAdmin()` | ✅ | `lib/actions/palestras.ts` | Lista todas (inclusive inativas) |
| `criarPalestra(data)` | ✅ | `lib/actions/palestras.ts` | CRUD palestras |
| `editarPalestra(id, data)` | ✅ | `lib/actions/palestras.ts` | CRUD palestras |
| `desativarPalestra(id)` | ✅ | `lib/actions/palestras.ts` | Toggle ativo/inativo |
| `duplicarPalestra(id)` | ✅ | `lib/actions/palestras.ts` | Duplica palestra existente |
| `exportarLeads(formato)` | ✅ | `lib/export.ts` | XLSX ou CSV |
| `getConfiguracoes()` | ✅ | `lib/actions/admin.ts` | Lista configurações do sistema |
| `salvarConfiguracao(chave, valor)` | ✅ | `lib/actions/admin.ts` | Atualiza configuração |
| `listarMensagens()` | ✅ | `lib/actions/admin.ts` | Histórico de mensagens WhatsApp |
| `testarWhatsApp(inscritoId)` | ✅ | `lib/actions/admin.ts` | Envia mensagem de teste |

---

### 10. Ordem de Build

| Fase | Passo | Descrição | Status | Arquivos-chave |
|------|-------|-----------|--------|----------------|
| **0** | 0.1 | Init Next.js + Shadcn + Tailwind | ✅ | `package.json`, `next.config.ts` |
| | 0.2 | next-themes, globals.css tokens, providers | ✅ | `providers.tsx`, `globals.css` |
| | 0.3 | Supabase client browser + server | ✅ | `lib/supabase/client.ts`, `server.ts` |
| | 0.4 | Tipos TypeScript | ✅ | `types/index.ts` |
| | 0.5 | Auth middleware (proxy.ts) | ✅ | `proxy.ts` |
| | 0.6 | Componentes base (layout, nav, header, utils) | ✅ | `components/*`, `lib/utils.ts` |
| **1** | 1.1 | Home: listar palestras com filtro por dia | ✅ | `app/page.tsx`, `palestra-card.tsx` |
| | 1.2 | Reserva: formulário + server action | ✅ | `app/reserva/[id]/page.tsx`, `reserva-form.tsx` |
| | 1.3 | Ticket: QR Code + calendário | ✅ | `app/ticket/[id]/page.tsx`, `qr-ticket.tsx` |
| **2** | 2.1 | Login admin | ✅ | `app/login/page.tsx` |
| | 2.2 | Dashboard + KPIs + gráficos (Recharts) | ✅ | `app/admin/page.tsx`, `kpi-card.tsx`, `dashboard-charts.tsx` |
| | 2.3 | Scanner QR (jsQR + câmera) | ✅ | `app/admin/scanner/page.tsx`, `scanner.tsx` |
| | 2.4 | Ações: liberar vaga, add manual | ✅ | `dashboard-actions.tsx`, `liberar-vaga-dialog.tsx`, `adicionar-participante-dialog.tsx` |
| **3** | 3.1 | CRUD palestras (criar, editar, duplicar, ativar/desativar) | ✅ | `app/admin/palestras/page.tsx`, `palestra-dialog.tsx` |
| | 3.2 | Leads table (busca, filtros, exportação) | ✅ | `app/admin/leads/page.tsx`, `leads-table.tsx` |
| **4** | 4.1 | Relatórios + Recharts (KPIs, gráficos, tabela) | ✅ | `app/admin/relatorios/`, `relatorios-charts.tsx`, `relatorios-tabela.tsx` |
| | 4.2 | Export XLSX + CSV | ✅ | `lib/export.ts` |
| **V3** | V3.1 | WhatsApp service layer (Z-API) | ✅ | `lib/whatsapp/` |
| | V3.2 | Disparo automático (reserva, check-in, espera, promoção) | ✅ | `lib/actions/reserva.ts`, `admin.ts` |
| | V3.3 | Admin config + auditoria mensagens | ✅ | `app/admin/whatsapp/` |
| **RN04** | — | Impedir reserva duplicada (email+palestra) | ✅ | `lib/actions/reserva.ts`, `admin.ts`, índice parcial |
| **Lembrete** | — | Cron 24h antes via WhatsApp | ✅ | `app/api/cron/lembrete/route.ts` |

---

### 11. Regras de Negócio (Referência Rápida)

| RN | Descrição | Onde |
|----|-----------|------|
| RN01 | Máx 20 participantes ativos | Trigger SQL `check_vagas_disponiveis` |
| RN02 | Sem overbooking | Trigger + validação server action |
| RN03 | Check-in até 10 min antes | Validação server action `realizarCheckIn` |
| RN04 | Limite 1 reserva por email por palestra | Índice único parcial + pre‑check server action |
| RN05 | Cancelamento por falta (manual) | Botão dashboard → server action |
| RN06 | Nome obrigatório | Zod form validation |
| RN07 | Email obrigatório | Zod form validation |
| RN08 | Telefone obrigatório | Zod form validation |
| RN09 | LGPD obrigatório | Checkbox + validação |
| RN10 | QR único (sem reuso) | Validação status === 'confirmado' |
| RN11 | Admin autenticado | Middleware + Supabase Auth |
| RN12 | Lista de Espera automática | Status `espera` + promoção ao cancelar |
| RN13 | Notificação WhatsApp | Disparo nos eventos de reserva, check-in, cancelamento, promoção, lembrete |

---

### 12. Dependências

```json
{
  "dependencies": {
    "next": "^16",
    "react": "^19",
    "react-dom": "^19",
    "next-themes": "latest",
    "@supabase/supabase-js": "latest",
    "@supabase/ssr": "latest",
    "qrcode.react": "latest",
    "jsqr": "latest",
    "recharts": "latest",
    "xlsx": "latest",
    "date-fns": "latest",
    "lucide-react": "latest",
    "zod": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "sonner": "latest"
  }
}
```

---

### 13. Configuração Vercel

**vercel.json**
```json
{
  "crons": [
    {
      "path": "/api/cron/lembrete",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Environment Variables (Vercel Dashboard → Settings → Environment Variables)**

| Nome | Valor | Obrigatório |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yjrcrdzqxeoclmctkkay.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | ✅ |
| `ZAPI_INSTANCE` | *(vazio)* | ❌ |
| `ZAPI_TOKEN` | *(vazio)* | ❌ |
| `ZAPI_ENABLED` | `0` | ✅ |
| `CRON_SECRET` | `openssl rand -hex 32` | ✅ |

---

### 14. Changelog

| Data | Mudança | Detalhes |
|------|---------|----------|
| 25/06/2026 | **Migração `middleware.ts` → `proxy.ts`** | Renomeado conforme Next.js 16 — `middleware.ts` estava deprecado |
| | **Fix cookie persistence no proxy** | `setAll` agora escreve cookies no `NextResponse`, resolvendo redirect loop no login admin |
| | **Fix lint: aspas não escapadas** | `palestras-client.tsx:141` — substituídas por entidades HTML |
| | **Fix lint: unused import** | `palestra-dialog.tsx:4` — `Loader2` removido |
| | **Redirect `/login` → `/admin/login`** | Rota duplicada eliminada, evita formulário de login desatualizado |
