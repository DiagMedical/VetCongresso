-- ============================================================
-- V3 — Delta: WhatsApp + Lista de Espera fix
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela: mensagens_enviadas (auditoria WhatsApp)
CREATE TABLE IF NOT EXISTS mensagens_enviadas (
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

-- 2. Tabela: configuracoes (admin UI)
CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Fix trigger: permitir INSERT com status 'espera' mesmo se lotado
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

-- 4. RLS mensagens_enviadas
ALTER TABLE mensagens_enviadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_mensagens" ON mensagens_enviadas;
CREATE POLICY "admin_all_mensagens" ON mensagens_enviadas
    FOR ALL USING (auth.uid() IN (SELECT id FROM admins));

DROP POLICY IF EXISTS "service_insert_mensagens" ON mensagens_enviadas;
CREATE POLICY "service_insert_mensagens" ON mensagens_enviadas
    FOR INSERT WITH CHECK (TRUE);

-- 5. RLS configuracoes
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_configuracoes" ON configuracoes;
CREATE POLICY "admin_all_configuracoes" ON configuracoes
    FOR ALL USING (auth.uid() IN (SELECT id FROM admins));

-- 6. RN04 — impedir reserva duplicada por email+palestra
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_reservation
ON inscritos (email, palestra_id)
WHERE status IN ('confirmado', 'check-in', 'espera');

-- 7. Coluna lembrete_enviado para controle de disparo
ALTER TABLE inscritos ADD COLUMN IF NOT EXISTS lembrete_enviado BOOLEAN DEFAULT FALSE;
