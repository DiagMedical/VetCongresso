-- ============================================================
-- Fix RLS: troca de auth.uid() para auth.email()
-- + seed do primeiro admin
-- ============================================================

-- 1. Inserir primeiro admin (caso não exista)
INSERT INTO admins (nome, email)
SELECT 'Wellington', 'wellington@diagnosticmedical.com.br'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'wellington@diagnosticmedical.com.br');

-- 2. Trocar policies de uid para email

-- palestras
DROP POLICY IF EXISTS "admin_all_palestras" ON palestras;
CREATE POLICY "admin_all_palestras" ON palestras
    FOR ALL USING (auth.email() IN (SELECT email FROM admins));

-- inscritos
DROP POLICY IF EXISTS "admin_all_inscritos" ON inscritos;
CREATE POLICY "admin_all_inscritos" ON inscritos
    FOR ALL USING (auth.email() IN (SELECT email FROM admins));

-- mensagens_enviadas
DROP POLICY IF EXISTS "admin_all_mensagens" ON mensagens_enviadas;
CREATE POLICY "admin_all_mensagens" ON mensagens_enviadas
    FOR ALL USING (auth.email() IN (SELECT email FROM admins));

-- configuracoes
DROP POLICY IF EXISTS "admin_all_configuracoes" ON configuracoes;
CREATE POLICY "admin_all_configuracoes" ON configuracoes
    FOR ALL USING (auth.email() IN (SELECT email FROM admins));

-- sorteio_leads
DROP POLICY IF EXISTS "admin_all_sorteio" ON sorteio_leads;
CREATE POLICY "admin_all_sorteio" ON sorteio_leads
    FOR ALL USING (auth.email() IN (SELECT email FROM admins));

-- 3. Criar policy para a própria tabela admins (para CRUD de admins)
DROP POLICY IF EXISTS "admin_all_admins" ON admins;
CREATE POLICY "admin_all_admins" ON admins
    FOR ALL USING (auth.email() IN (SELECT email FROM admins));
