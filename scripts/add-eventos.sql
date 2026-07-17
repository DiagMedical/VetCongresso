-- ============================================================
-- DiagnosticCRM — Tabela de Eventos
-- PODE RODAR MÚLTIPLAS VEZES (idempotente)
-- ============================================================

-- 1. Criar tabela eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    empresa TEXT NOT NULL CHECK (empresa IN ('vet', 'humana')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_eventos" ON eventos;
CREATE POLICY "admin_all_eventos" ON eventos
    FOR ALL USING (is_admin());

-- 3. Seed: criar eventos únicos existentes na tabela contacts
INSERT INTO eventos (nome, empresa)
SELECT DISTINCT TRIM(c.evento), COALESCE(c.empresa, 'vet')
FROM contacts c
WHERE c.evento IS NOT NULL AND TRIM(c.evento) != ''
ON CONFLICT (nome) DO NOTHING;
