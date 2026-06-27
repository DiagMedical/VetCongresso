import pg from 'pg'

const { Client } = pg

const required = ['DB_HOST', 'DB_PASSWORD']
const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`Variáveis obrigatórias faltando: ${missing.join(', ')}`)
  console.error('Crie um arquivo .env ou exporte as variáveis:')
  console.error('  DB_HOST=db.seuprojeto.supabase.co')
  console.error('  DB_PASSWORD=sua_senha')
  process.exit(1)
}

const client = new Client({
  host: process.env.DB_HOST,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

const schema = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS palestras (
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

CREATE TABLE IF NOT EXISTS inscritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    palestra_id UUID NOT NULL REFERENCES palestras(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    status TEXT DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'check-in', 'cancelado_por_falta', 'espera')),
    origem TEXT DEFAULT 'site',
    aceite_lgpd BOOLEAN DEFAULT FALSE,
    checkin_at TIMESTAMPTZ,
    cancelado_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW vagas_disponiveis AS
SELECT
    p.id,
    p.vagas_totais - COUNT(i.id) FILTER (WHERE i.status IN ('confirmado', 'check-in')) AS vagas_restantes
FROM palestras p
LEFT JOIN inscritos i ON i.palestra_id = p.id
WHERE p.ativo = TRUE
GROUP BY p.id, p.vagas_totais;

CREATE OR REPLACE FUNCTION check_vagas_disponiveis()
RETURNS TRIGGER AS $$
DECLARE
    vagas_livres INT;
BEGIN
    -- Lock the palestra row to serialize concurrent inserts (anti-overbooking)
    PERFORM 1 FROM palestras WHERE id = NEW.palestra_id FOR UPDATE;

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

DROP TRIGGER IF EXISTS before_insert_inscritos ON inscritos;
CREATE TRIGGER before_insert_inscritos
    BEFORE INSERT ON inscritos
    FOR EACH ROW
    EXECUTE FUNCTION check_vagas_disponiveis();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE email = auth.email());
$$;

ALTER TABLE palestras ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_palestras" ON palestras;
CREATE POLICY "public_read_palestras" ON palestras
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_insert_inscritos" ON inscritos;
CREATE POLICY "public_insert_inscritos" ON inscritos
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "public_read_inscrito" ON inscritos;
CREATE POLICY "public_read_inscrito" ON inscritos
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "admin_all_palestras" ON palestras;
CREATE POLICY "admin_all_palestras" ON palestras
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "admin_all_inscritos" ON inscritos;
CREATE POLICY "admin_all_inscritos" ON inscritos
    FOR ALL USING (is_admin());
`

const seed = `
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
(3, 'Shockwave como ferramenta do Clínico ao Fisiatra', 'Dra. Clarissa Tomazella', 'SHOCKWAVE', '2026-06-04 15:40:00-03', '2026-06-04 16:00:00-03', 20)
ON CONFLICT DO NOTHING;

INSERT INTO palestras (dia_evento, tema, palestrante, descricao, horario_inicio, horario_fim, vagas_totais, ativo)
SELECT 1, 'Sorteio Powerbank', 'Diagnostic Vet', 'Cadastro para sorteio de powerbank', '2026-07-01 00:00:00-03', '2026-07-01 00:00:00-03', 99999, FALSE
WHERE NOT EXISTS (SELECT 1 FROM palestras WHERE tema = 'Sorteio Powerbank');
`

try {
  await client.connect()
  console.log('Conectado ao Supabase PostgreSQL')

  console.log('Aplicando schema...')
  await client.query(schema)
  console.log('Schema aplicado com sucesso')

  console.log('Inserindo seed data...')
  await client.query(seed)
  console.log('Seed data inserido com sucesso (12 palestras + Sorteio Powerbank)')

  await client.end()
  console.log('Concluído!')
} catch (err) {
  console.error('Erro:', err.message)
  process.exit(1)
}
