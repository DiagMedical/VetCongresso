# 📋 PRD ARCHITECT V5

# Abraveq — Diagnostic Vet Silent Booking Platform

Versão: 5.0

Status: Approved for Development

---

# 1. VISÃO GERAL

## Nome do Projeto

Diagnostic Vet Silent Booking Platform

## Evento

ABRAVEQ

## Patrocinador

Diagnostic Vet

## Objetivo

Plataforma web mobile-first para gerenciamento de reservas, check-in e ocupação de palestras silenciosas realizadas durante a ABRAVEQ.

O sistema deve:

* Capturar leads qualificados
* Garantir ocupação máxima
* Eliminar cadeiras vazias
* Operar integralmente por smartphone ou tablet
* Gerar relatórios para o patrocinador

---

# 2. ESCOPO

## Incluído

* Agenda pública
* Reserva online
* Ticket digital
* QR Code
* Check-in
* Dashboard administrativo
* Dashboard executivo
* Gestão de palestras
* Gestão de leads
* Exportação XLSX
* Exportação CSV
* Dark Mode
* Supabase Auth

## Não incluído na V1

* WhatsApp automático
* Email marketing
* BI avançado
* Lista de espera automática

---

# 3. ESTRUTURA DO EVENTO

## Duração

3 dias

## Quantidade de palestras

11

### Dia 1

3 palestras

### Dia 2

5 palestras

### Dia 3

3 palestras

## Capacidade

20 vagas por sessão

## Capacidade Total

220 vagas

---

# 4. PERSONAS

## Veterinário

Objetivo:

Reservar vaga rapidamente.

Dispositivo:

Smartphone.

---

## Recepcionista

Objetivo:

Validar presença e liberar vagas.

Dispositivo:

Tablet.

---

## Organizador

Objetivo:

Monitorar indicadores.

Dispositivo:

Notebook ou Tablet.

---

# 5. REGRAS DE NEGÓCIO

## RN01

Cada palestra possui limite máximo de 20 participantes.

---

## RN02

Não permitir overbooking.

Validação obrigatória no banco.

---

## RN03

Check-in deve ocorrer até 10 minutos antes do início.

---

## RN04

Participantes sem check-in podem perder a vaga.

Status:

cancelado_por_falta

---

## RN05

Nome completo obrigatório.

---

## RN06

E-mail obrigatório.

---

## RN07

Telefone obrigatório.

---

## RN08

Aceite LGPD obrigatório.

---

## RN09

QR Code não pode ser utilizado duas vezes.

---

## RN10

Área administrativa protegida por autenticação.

---

# 6. FLUXO PRINCIPAL

Escanear QR

↓

Visualizar Agenda

↓

Selecionar Palestra

↓

Preencher Cadastro

↓

Receber Ticket

↓

Check-in

↓

Participação

---

# 7. STATUS

## confirmado

Reserva válida.

---

## check-in

Participante presente.

---

## cancelado_por_falta

Ausente após prazo.

---

## espera

Uso futuro.

---

# 8. DESIGN SYSTEM

## Inspiração

* Stripe
* Linear
* Vercel

---

## Fonte

Inter

---

## Light Theme

Background:

#FFFFFF

Cards:

#F8FAFC

Primary:

#0057B8

Success:

#00A86B

Danger:

#EF4444

---

## Dark Theme

Background:

#0F172A

Cards:

#1E293B

Primary:

#3B82F6

Text:

#F8FAFC

---

# 9. TELAS

## Home

Lista de palestras.

Filtros:

* Dia 1
* Dia 2
* Dia 3

---

## Reserva

Campos:

* Nome
* E-mail
* Telefone
* LGPD

---

## Ticket

Exibir:

* Tema
* Horário
* Palestrante
* QR Code

Botões:

* Google Calendar
* Apple Calendar

---

## Login

Email
Senha

---

## Dashboard Operacional

Indicadores:

* Inscritos
* Check-ins
* Cancelados
* Vagas disponíveis

Ações:

* Scanner
* Liberar vagas
* Adicionar participante

---

## Dashboard Executivo

Indicadores:

* Total de leads
* Total de reservas
* Comparecimento
* Ocupação

Gráficos:

* Reservas por dia
* Reservas por palestra
* Ranking de interesse

---

## Gestão de Palestras

Criar

Editar

Duplicar

Desativar

---

## Gestão de Leads

Pesquisa

Filtros

Exportação

---

# 10. WIREFRAMES

## Home

```text
┌────────────────────┐
│ ABRAVEQ            │
│ Diagnostic Vet     │
└────────────────────┘

[ Dia 1 ]
[ Dia 2 ]
[ Dia 3 ]

┌────────────────────┐
│ 09:00              │
│ Tema               │
│ 12/20 vagas        │
│ Reservar           │
└────────────────────┘
```

## Ticket

```text
┌────────────────────┐
│ Reserva Confirmada │
├────────────────────┤
│ Tema               │
│ Horário            │
├────────────────────┤
│ QR CODE            │
├────────────────────┤
│ Chegue 10 min antes│
└────────────────────┘
```

---

# 11. BANCO DE DADOS

## Tabela palestras

```sql
CREATE TABLE palestras (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

 dia_evento INT NOT NULL,

 tema TEXT NOT NULL,

 palestrante TEXT NOT NULL,

 descricao TEXT,

 horario_inicio TIMESTAMPTZ NOT NULL,

 horario_fim TIMESTAMPTZ NOT NULL,

 vagas_totais INT DEFAULT 20,

 ativo BOOLEAN DEFAULT TRUE,

 created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Tabela inscritos

```sql
CREATE TABLE inscritos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

 palestra_id UUID REFERENCES palestras(id),

 nome TEXT NOT NULL,

 email TEXT NOT NULL,

 telefone TEXT NOT NULL,

 status TEXT DEFAULT 'confirmado',

 origem TEXT DEFAULT 'site',

 checkin_at TIMESTAMPTZ,

 cancelado_at TIMESTAMPTZ,

 created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Tabela admins

```sql
CREATE TABLE admins (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

 nome TEXT NOT NULL,

 email TEXT UNIQUE NOT NULL,

 created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

# 12. RLS

## Público

Permitir:

SELECT palestras

INSERT inscritos

---

## Admin

CRUD completo

---

# 13. ESTRUTURA NEXT.JS

```text
app/

├─ page.tsx
├─ agenda/
├─ ticket/
├─ login/
├─ admin/
├─ relatorios/

components/

├─ palestra-card
├─ qr-ticket
├─ scanner
├─ dashboard
├─ charts

lib/

├─ supabase
├─ qr
├─ calendar
```

---

# 14. EXPORTAÇÃO

## XLSX

Campos:

Nome

Email

Telefone

Palestra

Status

Data

---

## CSV

Mesmo layout.

---

# 15. RELATÓRIOS

## Por Palestra

* Reservas
* Check-ins
* Cancelamentos
* Taxa de Ocupação

## Por Dia

* Leads
* Presentes
* Cancelados

## Evento

* Total de Leads
* Ranking de Palestras
* Taxa de Comparecimento

---

# 16. ROADMAP

## MVP

* Agenda
* Reserva
* Ticket
* QR
* Dashboard

## V2

* Lista de Espera

## V3

* WhatsApp

## V4

* Analytics

---

# 17. CRITÉRIOS DE ACEITE

* Sem overbooking
* Check-in funcionando
* QR único
* Relatórios corretos
* Exportação XLSX funcionando
* Dark Mode funcionando
* Mobile First aprovado

---

# 18. PROMPT MESTRE PARA IA

Construir aplicação completa utilizando Next.js 15 App Router, TypeScript, TailwindCSS, Shadcn/UI e Supabase.

Implementar todas as telas, banco de dados, autenticação, dashboard, relatórios, QR Code, exportação XLSX, tema claro/escuro e regras de negócio descritas neste documento.

Utilizar arquitetura escalável, mobile-first e design inspirado em Stripe, Linear e Vercel.
