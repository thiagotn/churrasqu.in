# Fatia 0 — Fundação

**Status: DONE**

## Objetivo

Monorepo funcionando com o domínio do calculator puro e 100% testado, antes de qualquer IO.

## Checklist

- [x] Monorepo com npm workspaces (`apps/*`) — ver [ADR 0001](../decisions/0001-npm-workspaces.md)
- [x] `apps/api` NestJS 11 com `modules/calculator` (módulo puro, sem IO)
- [x] Regras portadas do protótipo (`Churras Calc.dc.html`, não só do README): gramagem 420/320/200g, stretch por duração (virada de dia, clamp 1–14h), gourmet ×1.05, arredondamentos (kg múltiplo de 0.5, unidades p/ cima), 4 `alcoholMode`, fatores de acompanhamentos/essenciais, "gelo extra" ≥ 7h, opcionais desligados, edits/prices/remoção, total + rateio por adulto, slug
- [x] Ids de item estáveis por nome (`medio-picanha`) — ver [ADR 0002](../decisions/0002-ids-estaveis-de-item.md)
- [x] Testes Jest: 36 passando, incluindo cenário verificado à mão (R$ 235,50 / R$ 117,75 por adulto)
- [x] `apps/web` Next.js 15 (App Router) + Tailwind v4 com design tokens do handoff em `@theme` e fontes Bangers/Nunito

## Como verificar

```bash
npm test          # na raiz
npm run build     # api + web compilam
```
