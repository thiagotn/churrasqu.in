# Fatia 7 — Painel "Meus churras" + quem pagou

**Status: DONE**

## Objetivo

Área logada para gerir os churras salvos: compartilhar, retomar a edição e controlar quem já pagou o rateio — com o organizador decidindo se "quem pagou" aparece no convite público (default: oculto).

## Design

Canvas no Claude Design (4 artboards no estilo do handoff): painel mobile, cobranças mobile, painel desktop e empty state — https://claude.ai/code/artifact/bf508cbd-10f2-4ee3-86c5-e754936cec3c. A UI implementada segue os artboards; as cobranças abrem expandindo dentro do card (mesmos blocos do artboard de cobranças).

## Checklist

- [x] Migration `paid_tracking`: `Rsvp.paid/paidAt`, `Barbecue.showPaidPublicly` (default false)
- [x] API: `GET /barbecues[/:id]` inclui `rsvps` + `confirmedCount/paidCount/showPaidPublicly`; `PATCH /barbecues/:id/rsvps/:rsvpId {paid}` (dono; intruso → 404); `PATCH /barbecues/:id/paid-visibility`
- [x] Convite público: `confirmedDetailed` (`{name, paid}`) só quando o organizador liga o toggle; `confirmed` mantido para compat
- [x] Domínio: `adjustmentsFromSnapshot(input, snapshot)` em `packages/calculator` — reconstrói edits/prices pelos ids estáveis (ADR 0002); testes de roundtrip
- [x] Front `/meus`: lista de cards (data/total/chips), cobranças expandíveis (arrecadado, faltam, toggle público, marcar pago), copiar link, "ROLOU" para datas passadas, empty state, login embutido (AuthScreen reaproveitado)
- [x] "Editar lista": snapshot → `sessionStorage` → wizard reaberto em `#lista` com ajustes reconstruídos e CTA "Atualizar"
- [x] Header do wizard ganha pill "Meus churras"; pills de confirmados no convite mostram ✓ quando público
- [x] e2e: +4 testes (contadores, dono/intruso, visibilidade, desmarcar) — 25 e2e no total; roundtrip no pacote (43 unit)
- [x] Validação no browser (390px): painel → marcar pago → toggle → check no convite → retomar edição com total idêntico ao salvo

## Como verificar

```bash
npm test
# browser: salvar um churras → /meus → Cobranças → marcar pago → ligar "mostrar no convite"
# → abrir /ho/<slug> (pill com ✓) → Editar lista (wizard reabre com os ajustes)
```

## Notas

- A cobrança é por adulto do rateio; quem "leva alguém" conta +1 na presença mas o valor de referência segue `perAdult` (refinamento futuro se necessário).
- Logout entrou no `/meus` (botão "Sair").
