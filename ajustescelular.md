# Diagnóstico Mobile — VetCongresso

> Data: 30/06/2026
> Apenas diagnóstico, sem alterações.

---

## 🟢 O que está BEM feito

| Área | Detalhes |
|------|----------|
| **Páginas públicas** (Landing, Palestras, Reserva, Ticket, Sorteio) | Excelentes — `max-w-*`, `flex-wrap`, `sm:text-4xl`, grids responsivos, botões full-width. Zero problema. |
| **Formulários** (Reserva, Sorteio/Cadastro) | `w-full` em todos os inputs, `min-h-[44px]` nos botões de submit, espaçamento correto. |
| **Palestra Card** (público) | `min-h-[44px]` no botão reservar, `size-[44px]` nos botões de calendário, `line-clamp-2` na descrição. Modelo mobile-first. |
| **Chat FAB** | `size-14` (56px) no botão, painel `w-full sm:max-w-md`, chips com `flex-wrap`. |
| **Nav mobile do Admin** | `Sheet` (drawer) com `w-64`, links com `min-h-[44px]`, hamburger `lg:hidden`, close button. Muito bem feito. |
| **Header Admin** | `px-4 py-3 md:px-6`, logout com `min-h-[44px]`. |
| **Scanner** | `playsInline` (essencial p/ iOS), `facingMode: 'environment'`, mira visual cyan. |
| **PWA** | `standalone`, `portrait-primary`, ícones 192+512, `theme-color`, `apple-mobile-web-app-capable`. |
| **Acessibilidade mobile** | Skip-link, `prefers-reduced-motion`, `aria-label`, `aria-live`, `sr-only` em colunas de ação. |
| **CTAs principais** | Consistentemente `min-h-[44px]` em submit, nav, reservar — touch target correto em tudo que importa. |

---

## 🔴 PROBLEMA PRINCIPAL — Tabelas do Admin (scroll horizontal)

**Todas** as tabelas do admin exigem scroll horizontal no celular. Elas estão com `overflow-x-auto`, então o conteúdo não corta, mas a UX é ruim — o usuário precisa deslizar pra ver colunas escondidas.

| Página | Arquivo | `min-w` | Colunas |
|--------|---------|---------|---------|
| **Leads** | `leads-table.tsx` | **980px** | 8+ |
| **Sorteio** | `sorteio-admin.tsx` | **760px** | 5 |
| **WhatsApp Config** | `whatsapp-config.tsx` | **720px** | 5 |
| **Admins** | `admins-client.tsx` | **640px** | 4 |
| **Palestras** | `palestras-client.tsx` | implícito | 7 |
| **Relatórios** | `relatorios-tabela.tsx` | implícito | **9** |
| **Dashboard tabela** | `dashboard-tabela-palestras.tsx` | implícito | 7 |

> Sem uma view mobile (card layout ou colunas ocultas com `hidden md:table-cell`), o admin no celular é basicamente "deslize pra ver o resto".

---

## 🟡 BOTÕES DE AÇÃO pequenos demais (< 44px)

Icones dentro de tabelas com `p-1.5` → ~28px de touch target (ideal: 44px):

| Onde | Botões afetados |
|------|----------------|
| `leads-table.tsx` | Botão deletar (lixeira) |
| `palestras-client.tsx` | **7 botões** em cada linha (Editar, Duplicar, Ver, Google Cal, Apple Cal, Toggle, Excluir) |
| `admins-client.tsx` | Botão deletar admin |
| `qr-ticket.tsx` | Botões de calendário (~36px) |
| `scanner.tsx` | "Parar Scanner" (~36px) |
| `pagination.tsx` | Números de página (~36px) |

> O detalhe: botões de submit/CTA principais estão com `min-h-[44px]` correto. O problema é só nos **botões de ícone** dentro das tabelas.

---

## 🟡 Detalhes menores

1. **Sem `safe-area-inset`** — o app é PWA standalone com `black-translucent`, então em iPhones com notch o conteúdo pode ir atrás da status bar. Faltaria `padding-top: env(safe-area-inset-top)`.

2. **QR do Ticket fixo em 260px** (`size-[260px]`) — cabe em quase todos os celulares, mas em telas de 320px de largura com padding fica apertado.

3. **Chart ranking horizontal** — `YAxis width={140}` reserva 140px pros labels, deixando pouco espaço pro gráfico em si no mobile.

4. **Chat FAB** (`fixed bottom-6 right-6`) — pode sobrepor conteúdo no final da página. Sem padding extra no conteúdo para compensar.

---

## 📊 Resumo visual

```
Público:      ████████████████████ 100% — sem problemas
Admin nav:    ████████████████████ 100% — drawer excelente
Formulários:  ████████████████████ 100% — mobile-first
Scanner:      █████████████████⬜⬜  85% — touch targets menores
PWA:          █████████████████⬜⬜  85% — falta safe-area
Tabelas:      ███⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  20% — overflow horizontal
Touch targets:█████████████████⬜⬜  85% — CAs ok, ícones não
```

---

## Prioridade sugerida (se for corrigir)

1. **Tabela de Leads** — a mais usada no evento, converter para card view no mobile ou ocultar colunas
2. **Tabela de Palestras** — 7 botões de ícone em cada linha, touch targets muito pequenos
3. **Botões de ícone** — fix rápido: aumentar `p-1.5` → `p-2.5` ou `min-h-[44px]`
4. **Safe-area-inset** — importante para iPhones com notch usando a PWA standalone
