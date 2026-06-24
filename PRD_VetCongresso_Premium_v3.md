# VetCongresso Silent Booking
## PRD Premium v3.0

# Resumo Executivo

Sistema web mobile-first para gerenciamento de reservas de palestras silenciosas em congresso veterinário.

Duração do evento: 3 dias
Quantidade de palestras: 11
Capacidade por palestra: 20 participantes

Objetivos:
- Captura de leads
- Controle de presença
- Ocupação máxima
- Operação simplificada

---

# Stack Tecnológica

Frontend:
- Next.js 15
- App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI

Backend:
- Supabase

Banco:
- PostgreSQL

Deploy:
- Vercel

---

# Tema Visual

## Tema Claro

- Fundo branco
- Azul institucional
- Verde sucesso
- Vermelho alerta

## Tema Escuro

- Fundo #0F172A
- Cards #1E293B
- Texto claro
- Azul #3B82F6

Toggle:
🌙 / ☀️

---

# Estrutura do Evento

Dia 1
- Palestra 01
- Palestra 02
- Palestra 03

Dia 2
- Palestra 04
- Palestra 05
- Palestra 06
- Palestra 07
- Palestra 08

Dia 3
- Palestra 09
- Palestra 10
- Palestra 11

---

# Regras de Negócio

RN01 - Máximo 20 participantes

RN02 - Sem overbooking

RN03 - Check-in até 10 minutos antes

RN04 - Cancelamento por falta

RN05 - LGPD obrigatório

RN06 - QR único

RN07 - Login administrativo

---

# Status

- confirmado
- check-in
- cancelado_por_falta
- espera

---

# Banco de Dados

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

# Telas

## Tela Pública

- Lista de palestras
- Filtro por dia
- Vagas disponíveis
- Botão reservar

## Reserva

Campos:
- Nome
- Email
- WhatsApp
- LGPD

## Ticket

- QR Code
- Dados da palestra
- Adicionar ao calendário

## Painel Admin

Indicadores:
- Inscritos
- Check-ins
- Cancelados
- Vagas

Botões:
- Scanner QR
- Liberar vagas
- Adicionar participante

---

# Relatórios

Por palestra:
- Inscritos
- Check-ins
- Cancelados

Por dia:
- Ocupação
- Comparecimento

Evento:
- Total de leads
- Taxa de presença

---

# Exportações

- Excel XLSX
- CSV

---

# Integrações Futuras

- WhatsApp
- Fila automática
- Dashboard executivo
- BI

---

# Prompt de Implementação

Construir sistema completo utilizando Next.js App Router, TypeScript,
Tailwind CSS, Shadcn/UI e Supabase seguindo todas as regras de negócio
descritas neste documento.
