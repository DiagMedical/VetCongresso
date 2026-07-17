-- ============================================================
-- DiagnosticCRM — Schema de Dados
-- Migração: tabelas do CRM (contacts, pipeline, deals, activities)
-- PODE RODAR MÚLTIPLAS VEZES (idempotente)
-- ============================================================

-- 1. CONTATOS (generalizado de inscritos + sorteio_leads)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    origem TEXT DEFAULT 'manual',
    vendedor TEXT DEFAULT '',
    observacoes TEXT,
    tags TEXT[] DEFAULT '{}',
    interesses_vet TEXT[] DEFAULT '{}',
    interesses_humano TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1b. EVENTOS (eventos/campanhas gerenciados pelo admin)
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    empresa TEXT NOT NULL CHECK (empresa IN ('vet', 'humana')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PIPELINE STAGES (configurável pelo admin)
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    ordem INT NOT NULL,
    cor TEXT DEFAULT '#3B82F6',
    probabilidade INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEALS (oportunidades)
CREATE TABLE IF NOT EXISTS deals (
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

-- 4. ATIVIDADES (histórico de interações)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('nota', 'call', 'email', 'whatsapp', 'meeting', 'task')),
    descricao TEXT,
    responsavel TEXT DEFAULT '',
    data_atividade TIMESTAMPTZ DEFAULT NOW(),
    concluido BOOLEAN DEFAULT TRUE
);

-- 5. Migrar dados existentes de inscritos para contacts (uma vez)
INSERT INTO contacts (nome, email, telefone, origem, vendedor, created_at, updated_at)
SELECT DISTINCT ON (LOWER(i.email))
    i.nome,
    i.email,
    i.telefone,
    i.origem,
    COALESCE(i.vendedor, ''),
    i.created_at,
    NOW()
FROM inscritos i
WHERE i.email IS NOT NULL AND i.email != ''
ON CONFLICT DO NOTHING;

-- Migrar sorteio_leads para contacts
INSERT INTO contacts (nome, email, telefone, origem, vendedor, created_at, updated_at)
SELECT DISTINCT ON (LOWER(s.email))
    s.nome,
    s.email,
    s.whatsapp,
    'sorteio',
    COALESCE(s.vendedor, ''),
    s.created_at,
    NOW()
FROM sorteio_leads s
WHERE s.email IS NOT NULL AND s.email != ''
ON CONFLICT DO NOTHING;

-- 6. Seed default pipeline stages (se vazio)
INSERT INTO pipeline_stages (nome, ordem, cor, probabilidade)
SELECT * FROM (VALUES
    ('Novo Lead',    1, '#3B82F6', 10),
    ('Contatado',    2, '#8B5CF6', 25),
    ('Qualificado',  3, '#F59E0B', 50),
    ('Proposta',     4, '#EC4899', 70),
    ('Negociação',   5, '#EF4444', 85),
    ('Fechado',      6, '#10B981', 100),
    ('Perdido',      7, '#6B7280', 0)
) AS v (nome, ordem, cor, probabilidade)
WHERE NOT EXISTS (SELECT 1 FROM pipeline_stages LIMIT 1);

-- 7. RLS Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_contacts" ON contacts;
CREATE POLICY "admin_all_contacts" ON contacts
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_all_pipeline_stages" ON pipeline_stages;
CREATE POLICY "admin_all_pipeline_stages" ON pipeline_stages
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_all_deals" ON deals;
CREATE POLICY "admin_all_deals" ON deals
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_all_activities" ON activities;
CREATE POLICY "admin_all_activities" ON activities
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_all_eventos" ON eventos;
CREATE POLICY "admin_all_eventos" ON eventos
    FOR ALL USING (is_admin());

-- 8. Índices
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_vendedor ON contacts(vendedor);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage_id ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_vendedor ON deals(vendedor);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_tipo ON activities(tipo);
