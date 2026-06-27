import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`Variáveis obrigatórias faltando: ${missing.join(', ')}`)
  console.error('Adicione SUPABASE_SERVICE_ROLE_KEY ao .env.local e rode:')
  console.error('  node --env-file .env.local scripts/backup.mjs')
  process.exit(1)
}

const TABLES = [
  { name: 'palestras', order: 'id' },
  { name: 'inscritos', order: 'id' },
  { name: 'admins', order: 'id' },
  { name: 'configuracoes', order: 'chave' },
  { name: 'sorteio_leads', order: 'id' },
  { name: 'mensagens_enviadas', order: 'id' },
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

  for (const { name, order } of TABLES) {
    const { data, error } = await supabase
      .from(name)
      .select('*')
      .order(order, { ascending: true })

    if (error) {
      console.error(`  Erro ao buscar ${name}: ${error.message}`)
      continue
    }

    const filePath = path.join(dir, `${name}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data ?? [], null, 2), 'utf-8')
    metadata.tables[name] = { rows: data?.length ?? 0 }
    console.log(`  ${name}: ${data?.length ?? 0} linhas → ${filePath}`)
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
