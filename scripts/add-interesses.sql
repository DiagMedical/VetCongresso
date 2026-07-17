-- ============================================================
-- Adicionar interesses (vet + humano) aos contatos
-- PODE RODAR MÚLTIPLAS VEZES (idempotente)
-- ============================================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS interesses_vet TEXT[] DEFAULT '{}';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS interesses_humano TEXT[] DEFAULT '{}';

-- Seed das listas de equipamentos na configuração (se não existir)
INSERT INTO configuracoes (chave, valor, descricao)
SELECT 'interesses_vet', '["ShockWave Medispec","Radial Pet Neo","Magneto Hi-PEMF","PMST LOOP Hi-PEMF","Laser Cirúrgico","Laser Terapêutico","Endoscópio","Processador de Vídeo","Ultrassom Portátil","Outros"]', 'Lista de equipamentos - área Veterinária'
WHERE NOT EXISTS (SELECT 1 FROM configuracoes WHERE chave = 'interesses_vet');

INSERT INTO configuracoes (chave, valor, descricao)
SELECT 'interesses_humano', '["ShockWave","Radial","Hi-PEMF","Laser","Endoscopia","Ultrassom","Outros"]', 'Lista de equipamentos - área Humana'
WHERE NOT EXISTS (SELECT 1 FROM configuracoes WHERE chave = 'interesses_humano');
