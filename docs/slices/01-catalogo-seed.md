# Fatia 1 — Catálogo e seed de preços + API de estimativa

**Status: DONE**

## Objetivo

O catálogo (níveis, cortes, proporções, acompanhamentos, preços de referência) vira uma fonte única consumível pelo backend **e** pelo frontend, e a API passa a expor os endpoints públicos de leitura/estimativa sugeridos no handoff.

## Escopo

- Extrair o domínio puro para `packages/calculator` (workspace compartilhado) — ver [ADR 0003](../decisions/0003-pacote-calculator-compartilhado.md). O módulo NestJS vira uma casca fina sobre o pacote.
- `GET /catalog/tiers` — seed completo dos 3 níveis (metadados + itens + preços de referência).
- `POST /barbecues/estimate` — público, sem salvar: recebe evento (+ ajustes opcionais) e devolve lista resolvida, totais e os 3 totais por nível (para os cards da tela 2).
- Validação com `class-validator` (ValidationPipe global): inteiros ≥ 0, horários `HH:mm`, enums de nível/política, **ao menos 1 adulto**.
- Testes: unidade (catálogo íntegro — proporções somam 1) + e2e com Supertest (200/400).

**Fora de escopo:** persistência em banco (preços de referência continuam em código como seed; migram para tabela + seed do Prisma/TypeORM na fatia 3, quando o banco entra).

## Checklist

- [x] `packages/calculator` criado; api e web dependem dele
- [x] Módulo `catalog` com `GET /catalog/tiers`
- [x] Módulo `barbecues` com `POST /barbecues/estimate` (+ `tierTotals`)
- [x] ValidationPipe global + DTOs com class-validator (+ CORS para o front)
- [x] Teste de integridade do catálogo (proporções por nível somam 1)
- [x] e2e Supertest: estimativa válida, ajustes aplicados, payload inválido → 400, 0 adultos → 400
- [x] Roadmap atualizado + commit

## Como verificar

```bash
npm test
npm run dev:api   # e então:
curl localhost:3001/api/catalog/tiers
curl -X POST localhost:3001/api/barbecues/estimate -H 'content-type: application/json' \
  -d '{"men":6,"women":5,"kids":3,"startTime":"12:30","endTime":"19:00","alcoholMode":"lista","tier":"medio"}'
```
