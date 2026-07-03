-- Adiciona coluna vendedor nas tabelas (100% seguro, só ADD COLUMN)
ALTER TABLE inscritos ADD COLUMN IF NOT EXISTS vendedor TEXT DEFAULT '';
ALTER TABLE sorteio_leads ADD COLUMN IF NOT EXISTS vendedor TEXT DEFAULT '';
