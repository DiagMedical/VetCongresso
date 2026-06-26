-- ============================================================
-- Migração: Substituir palestras antigas pelos dados reais
-- Executar no SQL Editor do Supabase Dashboard
-- ============================================================

-- Remove palestras antigas (exceto Sorteio Powerbank)
DELETE FROM palestras WHERE ativo = TRUE;

-- Insere nova grade
INSERT INTO palestras (dia_evento, tema, palestrante, descricao, horario_inicio, horario_fim, vagas_totais) VALUES
-- Dia 1 — 02/06 (Quinta)
(1, 'Inovação em Foco — O potencial das Ondas de Choque', 'Dra. Elisa Holthausen', 'SHOCKWAVE', '2026-06-02 11:20:00-03', '2026-06-02 11:40:00-03', 20),
(1, 'Atuação do HI-PEMF na reabilitação: indicações e cuidados', 'Dr. Luiz Mattos', 'HI-PEMF', '2026-06-02 16:30:00-03', '2026-06-02 16:50:00-03', 20),
(1, 'Laser Diodo nos tratamentos das Afecções Respiratórias Superiores', 'Dr. Felipe Siqueira', 'CIRURGIA', '2026-06-02 17:00:00-03', '2026-06-02 17:20:00-03', 20),

-- Dia 2 — 03/06 (Sexta)
(2, 'Atuação do HI-PEMF na reabilitação: indicações e cuidados', 'Dr. Luiz Mattos', 'HI-PEMF', '2026-06-03 10:00:00-03', '2026-06-03 10:20:00-03', 20),
(2, 'Inovação em Foco — O potencial das Ondas de Choque', 'Dra. Elisa Holthausen', 'SHOCKWAVE', '2026-06-03 14:30:00-03', '2026-06-03 14:40:00-03', 20),
(2, 'HI-PEMF na Prática Veterinária Equina: Modelos de Negócio e Precificação', 'Dr. Luiz Mattos', 'HI-PEMF', '2026-06-03 15:30:00-03', '2026-06-03 15:50:00-03', 20),
(2, 'Shockwave como ferramenta do Clínico ao Fisiatra', 'Dra. Clarissa Tomazella', 'SHOCKWAVE', '2026-06-03 16:30:00-03', '2026-06-03 16:50:00-03', 20),
(2, 'Do Haras ao Hipódromo: Endoscopia Portátil como Ferramenta de Diagnóstico', 'Dr. Felipe Siqueira', 'ENDOSCOPIA', '2026-06-03 17:00:00-03', '2026-06-03 17:20:00-03', 20),

-- Dia 3 — 04/06 (Sábado)
(3, 'Atuação do HI-PEMF na reabilitação: indicações e modelos de negócios', 'Dr. Luiz Mattos', 'HI-PEMF', '2026-06-04 10:40:00-03', '2026-06-04 11:00:00-03', 20),
(3, 'Laser Diodo nos tratamentos das Afecções Respiratórias Superiores', 'Dr. Felipe Siqueira', 'CIRURGIA', '2026-06-04 14:00:00-03', '2026-06-04 14:20:00-03', 20),
(3, 'Shockwave como ferramenta do Clínico ao Fisiatra', 'Dra. Clarissa Tomazella', 'SHOCKWAVE', '2026-06-04 15:40:00-03', '2026-06-04 16:00:00-03', 20);
