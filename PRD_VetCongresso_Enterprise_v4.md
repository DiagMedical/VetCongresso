# 📋 PRD ENTERPRISE — VetCongresso Silent Booking

## Versão 4.0

---

# 1. Visão Geral

## Descrição

O VetCongresso Silent Booking é uma plataforma web mobile-first destinada ao gerenciamento de reservas para palestras silenciosas realizadas em congressos veterinários.

O sistema permite que visitantes reservem assentos para palestras através de QR Codes distribuídos no estande do patrocinador, gerando leads qualificados e garantindo a máxima ocupação das sessões.

---

## Objetivos Estratégicos

### Objetivos Primários

* Captura de leads qualificados
* Ocupação máxima das sessões
* Controle eficiente de presença
* Redução de cadeiras vazias
* Operação simplificada para recepção

### Objetivos Secundários

* Relatórios de participação
* Métricas de interesse por tema
* Base de contatos para pós-evento
* Histórico de comparecimento

---

# 2. Dados do Evento

## Estrutura

Evento com 3 dias de duração.

### Dia 1

* 3 palestras

### Dia 2

* 5 palestras

### Dia 3

* 3 palestras

### Totais

* 11 palestras
* 20 vagas por palestra
* 220 vagas totais

---

# 3. Personas

## Veterinário

### Perfil

* Participante do congresso
* Utiliza smartphone
* Circula pelos corredores do evento

### Objetivos

* Encontrar palestras interessantes
* Garantir vaga rapidamente
* Receber confirmação imediata

---

## Recepcionista

### Perfil

* Operador do estande
* Utiliza tablet ou smartphone

### Objetivos

* Validar participantes
* Liberar vagas rapidamente
* Manter ocupação máxima

---

## Organizador

### Perfil

* Responsável pelo evento

### Objetivos

* Acompanhar indicadores
* Exportar leads
* Avaliar resultados

---

# 4. Regras de Negócio

## RN01 — Capacidade Máxima

Cada palestra possui limite de 20 participantes ativos.

Participantes ativos:

* confirmado
* check-in

---

## RN02 — Overbooking Proibido

O sistema jamais poderá permitir mais de 20 participantes ativos por palestra.

A validação deverá ocorrer no banco de dados.

---

## RN03 — Regra dos 10 Minutos

O participante deverá realizar check-in até 10 minutos antes do início da palestra.

---

## RN04 — Liberação de Vagas

Participantes sem check-in poderão ter a vaga liberada.

Status alterado para:

```text
cancelado_por_falta
```

---

## RN05 — Captura Obrigatória de Lead

Campos obrigatórios:

* Nome completo
* E-mail
* Telefone

---

## RN06 — LGPD

Aceite obrigatório para armazenamento de dados.

---

## RN07 — Check-in Único

Um QR Code não poderá ser utilizado mais de uma vez.

---

## RN08 — Segurança Administrativa

Área administrativa protegida por autenticação.

---

# 5. Fluxo Principal

```text
Escanear QR Code

↓

Visualizar Agenda

↓

Selecionar Palestra

↓

Preencher Cadastro

↓

Receber Ticket

↓

Chegar ao Estande

↓

Check-in

↓

Participar da Sessão
```

---

# 6. Estados da Inscrição

```text
confirmado

↓

check-in
```

ou

```text
confirmado

↓

cancelado_por_falta
```

ou

```text
espera
```

---

# 7. Design System

## Inspiração

* Stripe
* Linear
* Vercel

---

## Tipografia

```text
Inter
```

---

## Tema Claro

### Background

```css
#FFFFFF
```

### Cards

```css
#F8FAFC
```

### Primária

```css
#2563EB
```

### Sucesso

```css
#10B981
```

### Erro

```css
#EF4444
```

---

## Tema Escuro

### Background

```css
#0F172A
```

### Cards

```css
#1E293B
```

### Primária

```css
#3B82F6
```

### Texto

```css
#F8FAFC
```

---

## Componentes

* Card
* Button
* Badge
* Dialog
* Table
* Tabs
* Toast
* Drawer
* Dropdown

---

# 8. Wireframes

## Tela Inicial

```text
┌─────────────────────────┐
│ VetCongresso            │
│ Reserve sua vaga        │
└─────────────────────────┘

[ Dia 1 ]
[ Dia 2 ]
[ Dia 3 ]

┌─────────────────────────┐
│ 09:00                   │
│ Anestesia Veterinária   │
│ 12/20 vagas             │
│ [ Reservar ]            │
└─────────────────────────┘
```

---

## Tela de Reserva

```text
Nome Completo

[____________]

Email

[____________]

WhatsApp

[____________]

☑ Aceito LGPD

[ Confirmar Reserva ]
```

---

## Ticket

```text
┌───────────────────────┐
│ Reserva Confirmada    │
├───────────────────────┤
│ Tema                  │
│ Horário               │
│ Palestrante           │
├───────────────────────┤
│      QR CODE          │
├───────────────────────┤
│ Chegue 10 min antes   │
└───────────────────────┘
```

---

## Dashboard Admin

```text
Inscritos: 20

Check-ins: 15

Cancelados: 3

Disponíveis: 2

[ Scanner QR ]

[ Liberar Vagas ]

[ Adicionar Participante ]
```

---

# 9. Requisitos Funcionais

## RF01

Listagem de palestras.

---

## RF02

Reserva de vaga.

---

## RF03

Ticket digital.

---

## RF04

QR Code dinâmico.

---

## RF05

Scanner via câmera.

---

## RF06

Check-in automático.

---

## RF07

Liberação de vagas.

---

## RF08

Cadastro manual de fila física.

---

## RF09

Dashboard administrativo.

---

## RF10

Relatórios.

---

## RF11

Exportação Excel.

---

## RF12

Tema Claro/Escuro.

---

## RF13

Adicionar ao Google Agenda.

---

## RF14

Adicionar ao Calendário Apple.

---

# 10. Requisitos Não Funcionais

## RNF01

Mobile First.

## RNF02

Responsivo.

## RNF03

HTTPS obrigatório.

## RNF04

Tempo de resposta inferior a 2 segundos.

## RNF05

Compatível com Android e iOS.

---

# 11. Banco de Dados

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

---

# 12. RLS Supabase

## Público

Permitir:

```text
SELECT palestras
INSERT inscritos
```

---

## Administrador

Permitir:

```text
SELECT
INSERT
UPDATE
DELETE
```

---

# 13. Estrutura do Projeto

```text
app/

├─ page.tsx
├─ agenda/
├─ ticket/
├─ admin/
├─ login/

components/

├─ ui/
├─ cards/
├─ scanner/
├─ dashboard/

lib/

├─ supabase/
├─ qr/
├─ calendar/
```

---

# 14. Relatórios

## Por Palestra

* Inscritos
* Check-ins
* Cancelados
* Taxa de Ocupação

---

## Por Dia

* Total de inscritos
* Total de presentes
* Total de cancelados

---

## Evento Completo

* Total de Leads
* Taxa de Comparecimento
* Ranking de Palestras

---

# 15. Exportações

## XLSX

Campos:

* Nome
* E-mail
* Telefone
* Palestra
* Status
* Data

---

## CSV

Mesmo layout do XLSX.

---

# 16. Integrações Futuras

## V2

* Lista de espera automática

## V3

* WhatsApp

## V4

* E-mail marketing

## V5

* Dashboard BI

---

# 17. Critérios de Aceitação

## Reserva

* Deve funcionar em menos de 30 segundos.

## Check-in

* Deve ocorrer em até 2 segundos.

## Vagas

* Nunca ultrapassar 20.

## QR Code

* Não aceitar reutilização.

## Relatórios

* Devem refletir dados em tempo real.

---

# 18. Roadmap

## MVP

* Reservas
* QR Code
* Check-in
* Dashboard

## Versão 2

* Lista de espera

## Versão 3

* WhatsApp

## Versão 4

* Analytics

---

# 19. Prompt Mestre para IA

Construir uma aplicação completa utilizando Next.js 15 App Router, TypeScript, TailwindCSS, Shadcn/UI e Supabase.

Implementar todas as telas, regras de negócio, banco de dados, autenticação administrativa, QR Code, scanner via câmera, dashboard operacional, relatórios, exportação XLSX, tema claro/escuro e arquitetura descrita neste documento.

O sistema deve ser mobile-first, responsivo, moderno, inspirado visualmente em Stripe, Linear e Vercel, com foco em simplicidade operacional durante eventos presenciais.
