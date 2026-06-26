-- ============================================================
-- Fix RLS: troca de auth.uid() para auth.email()
-- + função SECURITY DEFINER pra evitar recursão
-- + seed do primeiro admin
-- ============================================================

-- 0. Função auxiliar que Bypassa RLS na consulta à tabela admins
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE email = auth.email());
$$;

-- 1. Inserir primeiro admin (caso não exista)
INSERT INTO admins (nome, email)
SELECT 'Wellington', 'wellington@diagnosticmedical.com.br'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'wellington@diagnosticmedical.com.br');

-- 2. Trocar policies de uid para email usando a função is_admin()

-- palestras
DROP POLICY IF EXISTS "admin_all_palestras" ON palestras;
CREATE POLICY "admin_all_palestras" ON palestras
    FOR ALL USING (is_admin());

-- inscritos
DROP POLICY IF EXISTS "admin_all_inscritos" ON inscritos;
CREATE POLICY "admin_all_inscritos" ON inscritos
    FOR ALL USING (is_admin());

-- mensagens_enviadas
DROP POLICY IF EXISTS "admin_all_mensagens" ON mensagens_enviadas;
CREATE POLICY "admin_all_mensagens" ON mensagens_enviadas
    FOR ALL USING (is_admin());

-- configuracoes
DROP POLICY IF EXISTS "admin_all_configuracoes" ON configuracoes;
CREATE POLICY "admin_all_configuracoes" ON configuracoes
    FOR ALL USING (is_admin());

-- sorteio_leads
DROP POLICY IF EXISTS "admin_all_sorteio" ON sorteio_leads;
CREATE POLICY "admin_all_sorteio" ON sorteio_leads
    FOR ALL USING (is_admin());

-- admins (própria tabela)
DROP POLICY IF EXISTS "admin_all_admins" ON admins;
CREATE POLICY "admin_all_admins" ON admins
    FOR ALL USING (is_admin());
