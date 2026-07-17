import pg from 'pg'
import fs from 'fs'
import dns from 'dns'

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

// Tenta conectar via pooler (IPv4) ou direto (IPv6)
async function resolveDbHost(dbHost) {
  // Tenta resolver IPv6 primeiro (o db. hostname só tem AAAA record)
  try {
    const addresses = await dns.promises.resolve6(dbHost)
    return { host: addresses[0], family: 6 }
  } catch {
    // Fallback pra IPv4
    try {
      const addresses = await dns.promises.resolve4(dbHost)
      return { host: addresses[0], family: 4 }
    } catch {
      throw new Error(`Não foi possível resolver ${dbHost}`)
    }
  }
}

async function connectWithFallback() {
  const dbHost = process.env.DB_HOST || 'db.yjrcrdzqxeoclmctkkay.supabase.co'
  const password = process.env.DB_PASSWORD

  // Tenta pooler via projeto específico (SNI hostname)
  const projectRef = dbHost.replace(/^db\./, '').replace(/\.supabase\.co$/, '')
  const poolerConfigs = [
    {
      host: 'aws-0-us-west-1.pooler.supabase.com',
      port: 6543,
      ssl: { rejectUnauthorized: false, servername: `${projectRef}.supabase.co` },
    },
    {
      host: `${projectRef}.pooler.supabase.com`,
      port: 6543,
      ssl: { rejectUnauthorized: false },
    },
    {
      host: `${projectRef}.supabase.co`,
      port: 6543,
      ssl: { rejectUnauthorized: false },
    },
  ]
  for (const cfg of poolerConfigs) {
    try {
      const c = new Client({
        host: cfg.host,
        port: cfg.port,
        database: 'postgres',
        user: 'postgres',
        password,
        ssl: cfg.ssl,
      })
      await c.connect()
      console.log(`✓ Conectado via pooler: ${cfg.host}:${cfg.port}`)
      return c
    } catch (e) {
      console.log(`  Pooler ${cfg.host}:${cfg.port}: ${e.message}`)
    }
  }

  // Conecta direto resolvendo o hostname manualmente
  const { host, family } = await resolveDbHost(dbHost)
  console.log(`  Resolvido ${dbHost} → ${host} (IPv${family})`)

  const c = new Client({
    host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: {
      rejectUnauthorized: false,
      servername: dbHost, // SNI para o certificado SSL
    },
  })
  await c.connect()
  console.log(`✓ Conectado direto (IPv${family}).`)
  return c
}

async function main() {
  const client = await connectWithFallback()

  const sql = fs.readFileSync(new URL('crm-schema.sql', import.meta.url), 'utf-8')

  console.log('Aplicando schema CRM...')
  await client.query(sql)
  console.log('Schema CRM aplicado com sucesso!')

  console.log('\nTabelas criadas/verificadas:')
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('contacts', 'pipeline_stages', 'deals', 'activities')
    ORDER BY table_name
  `)
  for (const r of rows) {
    const { rows: countRows } = await client.query(`SELECT COUNT(*)::int AS c FROM "${r.table_name}"`)
    console.log(`  ✓ ${r.table_name} (${countRows[0].c} linhas)`)
  }

  await client.end()
  console.log('\nConcluído!')
}

main().catch((err) => {
  console.error('Erro:', err.message)
  process.exit(1)
})
