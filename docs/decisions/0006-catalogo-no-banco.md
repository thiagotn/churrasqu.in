# ADR 0006 — Catálogo de runtime no banco, seed a partir do pacote

**Status:** aceito (fatia 8) — resolve o adiamento registrado na fatia 3 / ADRs 0003 e 0004.

## Contexto

Os preços de referência viviam hardcoded em `packages/calculator` (ADR 0003): mudar um preço exigia
rebuild + deploy. O handoff sempre previu preços vindos de "backend/seed".

## Decisão

- **Fonte de RUNTIME = banco** (`CatalogTier`/`CatalogItem`, dinheiro em centavos): a api monta o
  `Catalog` a partir das tabelas, com **cache de 60s** — um `UPDATE` via psql reflete em até 1min,
  sem redeploy.
- **Fonte do CONTEÚDO do seed = pacote**: `apps/api/prisma/seed.cjs` (JS puro, roda no container) lê o
  `TIERS` de `@churrasquin/calculator` e faz upsert idempotente. Uma única definição dos dados.
- **Fallback = pacote**: tabelas vazias/indisponíveis (dev sem seed, unit tests) caem no `TIERS` — a
  api nunca fica sem catálogo.
- **Domínio recebe o catálogo como parâmetro** (`calculate(input, adjustments, catalog = TIERS)`) —
  retrocompatível; o front busca `GET /catalog/tiers` no mount (estado inicial = pacote, troca
  silenciosa) e mantém o recálculo instantâneo com os preços do banco.
- **Migrations+seed no deploy**: o initContainer da api no homelab roda `prisma migrate deploy` e o
  seed (idempotente) a cada rollout.

## Consequências

- Editar preço em produção = `UPDATE` no Postgres (via psql no cluster) — **admin UI fica fora** desta
  fatia; se um dia entrar, é um módulo `catalog` com PATCH + role de admin.
- Snapshot salvo continua imune a mudanças de preço (ADR 0004); só listas novas/re-salvas usam o preço novo.
- O e2e do catálogo roda serial (`maxWorkers: 1` no jest-e2e) porque muta preço compartilhado e restaura via seed.
