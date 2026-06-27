import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`Variáveis obrigatórias faltando: ${missing.join(', ')}`)
  console.error('Adicione ao .env.local:')
  console.error(`  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... (Service Role Key do Supabase Dashboard)`)
  process.exit(1)
}

const TABLES = [
  'palestras',
  'inscritos',
  'admins',
  'configuracoes',
  'sorteio_leads',
  'mensagens_enviadas',
]

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  )

  console.log('Conectado ao Supabase (service_role).')

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = path.resolve('backups', ts)
  fs.mkdirSync(dir, { recursive: true })

  const metadata = {
    backup_at: new Date().toISOString(),
    tables: {},
  }

  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error(`  Erro ao buscar ${table}: ${error.message}`)
      continue
    }

    const filePath = path.join(dir, `${table}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data ?? [], null, 2), 'utf-8')
    metadata.tables[table] = { rows: data?.length ?? 0 }
    console.log(`  ${table}: ${data?.length ?? 0} linhas → ${filePath}`)
  }

  const metaPath = path.join(dir, '_metadata.json')
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8')
  console.log(`\nMetadados salvos em ${metaPath}`)
  console.log(`Backup completo: ${dir}`)
}

main().catch((err) => {
  console.error('Erro no backup:', err)
  process.exit(1)
})
