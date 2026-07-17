-- Rastrear quando o deal mudou de estágio pela última vez
ALTER TABLE deals ADD COLUMN IF NOT EXISTS stage_moved_at TIMESTAMPTZ DEFAULT NOW();

-- Atualizar deals existentes com a data de criação
UPDATE deals SET stage_moved_at = created_at WHERE stage_moved_at IS NULL;
