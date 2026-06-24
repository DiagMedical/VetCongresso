import pg from 'pg'

const { Client } = pg

const client = new Client({
  host: 'db.yjrcrdzqxeoclmctkkay.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'DiagMedical321@#$&',
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

DROP TRIGGER IF EXISTS before_insert_inscritos ON inscritos;
CREATE TRIGGER before_insert_inscritos
    BEFORE INSERT ON inscritos
    FOR EACH ROW
    EXECUTE FUNCTION check_vagas_disponiveis();

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
    FOR ALL USING (auth.uid() IN (SELECT id FROM admins));

DROP POLICY IF EXISTS "admin_all_inscritos" ON inscritos;
CREATE POLICY "admin_all_inscritos" ON inscritos
    FOR ALL USING (auth.uid() IN (SELECT id FROM admins));
`

const seed = `
INSERT INTO palestras (dia_evento, tema, palestrante, descricao, horario_inicio, horario_fim, vagas_totais) VALUES
(1, 'Anestesia em Pequenos Animais', 'Dr. Silva', 'Técnicas modernas de anestesia veterinária', '2026-07-01 09:00:00-03', '2026-07-01 10:00:00-03', 20),
(1, 'Ortopedia Veterinária', 'Dr. Santos', 'Avanços em ortopedia para pequenos animais', '2026-07-01 10:30:00-03', '2026-07-01 11:30:00-03', 20),
(1, 'Dermatologia Canina', 'Dra. Oliveira', 'Diagnóstico e tratamento de dermatopatias', '2026-07-01 14:00:00-03', '2026-07-01 15:00:00-03', 20),
(2, 'Cardiologia Felina', 'Dr. Souza', 'Abordagem clínica das cardiopatias felinas', '2026-07-02 09:00:00-03', '2026-07-02 10:00:00-03', 20),
(2, 'Oncologia Veterinária', 'Dr. Costa', 'Atualização em oncologia de pequenos animais', '2026-07-02 10:30:00-03', '2026-07-02 11:30:00-03', 20),
(2, 'Medicina Felina', 'Dra. Pereira', 'Particularidades da clínica de felinos', '2026-07-02 13:00:00-03', '2026-07-02 14:00:00-03', 20),
(2, 'Cirurgia de Tecidos Moles', 'Dr. Lima', 'Técnicas cirúrgicas em tecidos moles', '2026-07-02 14:30:00-03', '2026-07-02 15:30:00-03', 20),
(2, 'Diagnóstico por Imagem', 'Dra. Almeida', 'Interpretação de exames de imagem', '2026-07-02 16:00:00-03', '2026-07-02 17:00:00-03', 20),
(3, 'Neurologia Veterinária', 'Dr. Martins', 'Neurologia de pequenos animais', '2026-07-03 09:00:00-03', '2026-07-03 10:00:00-03', 20),
(3, 'Endocrinologia', 'Dra. Barbosa', 'Distúrbios endócrinos em cães e gatos', '2026-07-03 10:30:00-03', '2026-07-03 11:30:00-03', 20),
(3, 'Emergência e Cuidados Intensivos', 'Dr. Rocha', 'Manejo de emergências veterinárias', '2026-07-03 14:00:00-03', '2026-07-03 15:00:00-03', 20)
ON CONFLICT DO NOTHING;
`

try {
  await client.connect()
  console.log('Conectado ao Supabase PostgreSQL')

  console.log('Aplicando schema...')
  await client.query(schema)
  console.log('Schema aplicado com sucesso')

  console.log('Inserindo seed data...')
  await client.query(seed)
  console.log('Seed data inserido com sucesso (11 palestras)')

  await client.end()
  console.log('Concluído!')
} catch (err) {
  console.error('Erro:', err.message)
  process.exit(1)
}
