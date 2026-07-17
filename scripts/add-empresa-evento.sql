-- ============================================================
-- Adicionar empresa (vet/humana) e evento aos contatos
-- PODE RODAR MÚLTIPLAS VEZES (idempotente)
-- ============================================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT '';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS evento TEXT DEFAULT '';

-- Migrar leads existentes para ABRAVEQ 2026 (Diagnostic Vet)
UPDATE contacts
SET empresa = 'vet',
    evento = 'ABRAVEQ 2026'
WHERE empresa = ''
   OR empresa IS NULL;
