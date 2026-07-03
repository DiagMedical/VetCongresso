# Plano: Migrar Leads de Palestras → Sorteio

## Objetivo

Garantir que **todos** os leads de palestras (tabela `inscritos`) estejam também na tabela `sorteio_leads`, sem duplicar quem já está lá.

---

## Situação Atual

| Tabela | Campos | Constraint |
|--------|--------|------------|
| `inscritos` | nome, email, telefone, palestra_id, status, origem, aceite_lgpd, checkin_at, cancelado_at, created_at | `UNIQUE (email, palestra_id)` apenas para status ativos |
| `sorteio_leads` | nome, whatsapp, email, created_at | `UNIQUE (email)` |

- São tabelas **completamente independentes**
- `sorteio_leads.email` tem constraint `UNIQUE` — impossível duplicar por email
- Já existem dados reais em **ambas** as tabelas

---

## Regras de Segurança

### 1. NENHUM dado é apagado
- Zero `DELETE`, zero `DROP`, zero `UPDATE`
- Apenas `INSERT INTO sorteio_leads`

### 2. Zero risco de duplicação
- `sorteio_leads` tem `email UNIQUE` — o banco rejeita qualquer duplicata
- A query usa `WHERE NOT EXISTS` como dupla proteção

### 3. Zero impacto na tabela `inscritos`
- Reservas, check-ins, status, palestras — tudo permanece intacto
- Nenhuma alteração em `criarReserva`, `realizarCheckIn`, ou qualquer action existente

### 4. Idempotente
- Pode ser executado quantas vezes quiser — sempre o mesmo resultado seguro

---

## Plano de Implementação

### Passo 1 — Server action `migrarLeadsParaSorteio()`

**Arquivo:** `lib/actions/sorteio.ts`

```typescript
// Lógica:
// 1. Buscar TODOS os inscritos ativos (confirmado OU check-in)
// 2. Para cada inscrito, tentar INSERT em sorteio_leads
// 3. Se email já existe (UNIQUE constraint), ignorar silenciosamente
// 4. Retornar contador: { migrados: X, ignorados: Y }

// SQL equivalente por registro:
// INSERT INTO sorteio_leads (nome, whatsapp, email, created_at)
// SELECT nome, telefone, email, created_at
// FROM inscritos
// WHERE email NOT IN (SELECT email FROM sorteio_leads)
//   AND status IN ('confirmado', 'check-in')
// ON CONFLICT (email) DO NOTHING;
```

**Detalhes:**
- Campo `telefone` da tabela `inscritos` → mapeia para `whatsapp` em `sorteio_leads`
- Usa `ON CONFLICT (email) DO NOTHING` — se já existe, ignora sem erro
- Retorno: `{ migrados: number, ignorados: number, total_inscritos: number }`

### Passo 2 — Botão "Migrar Leads" no admin do sorteio

**Arquivo:** `app/admin/sorteio/sorteio-admin.tsx`

- Botão ao lado de "Sortear" e "Exportar CSV"
- Texto: "Migrar Leads → Sorteio"
- Ao clicar: chama `migrarLeadsParaSorteio()`
- Toast: "X leads migrados, Y ignorados (já existiam)"
- Desabilita durante execução

### Passo 3 — Auto-sync ao criar reserva (opcional)

**Arquivo:** `lib/actions/reserva.ts` → função `criarReserva`

- Após o insert em `inscritos`, faz insert condicional em `sorteio_leads`
- Mesma lógica: `ON CONFLICT (email) DO NOTHING`
- Transparente pro usuário — ele nem percebe

---

## Mapeamento de Campos

| inscritos | → | sorteio_leads |
|-----------|---|---------------|
| `nome` | → | `nome` |
| `telefone` | → | `whatsapp` |
| `email` | → | `email` |
| `created_at` | → | `created_at` (preserva data original) |

---

## Casos de Edge Cobertos

| Caso | Comportamento |
|------|---------------|
| Lead de palestra + já no sorteio (mesmo email) | `ON CONFLICT DO NOTHING` — ignora |
| Mesmo email reservou 3 palestras diferentes | `inscritos` tem 3 registros, mas só 1 email — só insere 1 vez no sorteio |
| Sorteio lead + nenhum cadastro de palestra | Não afetado — tabela `sorteio_leads` não é tocada pra esses |
| Inscrito cancelado_por_falta | **Não migrado** — filtro `status IN ('confirmado', 'check-in')` |
| Inscrito em lista de espera | **Não migrado** — filtro `status IN ('confirmado', 'check-in')` |
| Inscrito cadastrado manualmente pelo admin | **Migrado** — status `confirmado` |
| Campo telefone vazio | Migrado com telefone vazio — o admin pode limpar depois se quiser |
| Execução repetida do botão | Idempotente — resultado idêntico na 2ª, 3ª, 10ª vez |

---

## Riscos Eliminados

| Risco | Mitigação |
|-------|-----------|
| Duplicar leads no sorteio | `email UNIQUE` + `ON CONFLICT DO NOTHING` |
| Perder dados do sorteio existente | Zero DELETE — apenas INSERT |
| Quebrar reservas/check-ins | Zero alteração na tabela `inscritos` |
| Inserir lixo (cancelados/falta) | Filtro `status IN ('confirmado', 'check-in')` |
| Quebrar a página de leads | A merge atual (`source: 'inscrito' | 'sorteio'`) continua funcionando |

---

## Arquivos Alterados

| Arquivo | Alteração |
|---------|-----------|
| `lib/actions/sorteio.ts` | Nova function `migrarLeadsParaSorteio()` |
| `app/admin/sorteio/sorteio-admin.tsx` | Botão "Migrar Leads → Sorteio" |
| `lib/actions/reserva.ts` | (Passo 3 opcional) Auto-sync após reserva |

---

## Arquivos NÃO Alterados

- `types/index.ts`
- `scripts/schema.sql` (nenhuma alteração no banco)
- `lib/actions/admin.ts`
- `components/admin/leads-table.tsx`
- `app/admin/leads/page.tsx`
- Qualquer página pública
- Qualquer componente de reserva, ticket ou check-in

---

## Checklist de Validação

- [ ] `migrarLeadsParaSorteio()` retorna contadores corretos
- [ ] Toast mostra "X migrados, Y ignorados"
- [ ] Botão fica desabilitado durante execução
- [ ] Executar 2x seguidas → segunda vez retorna 0 migrados
- [ ] Página de leads continua mostrando ambos os sources
- [ ] Export CSV/XLSX inclui os novos dados
- [ ] Reservas/check-ins continuam funcionando normalmente
- [ ] Página pública de sorteio continua funcionando normalmente
