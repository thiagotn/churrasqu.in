# Fatia 8 — Catálogo no banco (seed)

**Status: DONE** — ver [ADR 0006](../decisions/0006-catalogo-no-banco.md).

## Objetivo

Preços de referência saem do código e viram dados: editáveis no Postgres sem redeploy, com seed
idempotente e fallback para o seed do pacote.

## Checklist

- [x] Migration `catalog`: `CatalogTier` + `CatalogItem` (kind `cut|side|optional`, centavos, unique por tier/kind/nome)
- [x] `prisma/seed.cjs` (JS puro) upserta a partir do `TIERS` do pacote; `prisma:seed` + `prisma.seed` no package.json; rodou 2× sem duplicar (33 itens)
- [x] `packages/calculator`: parâmetro `catalog` em `buildBaseList/calculate/adjustmentsFromSnapshot` (default `TIERS`, retrocompatível)
- [x] `CatalogService`: banco com cache 60s + fallback pacote; `GET /catalog/tiers` servido do banco; `CalculatorService.estimate` (agora async) usa o catálogo de runtime — snapshot de save/update idem
- [x] Front: busca `/catalog/tiers` no mount e passa o catálogo ao `calculate` e às telas (primeira render instantânea com o pacote, troca silenciosa)
- [x] e2e (serial): seed idempotente, `GET /catalog/tiers` reflete preço mutado no banco, `estimate` usa o preço do banco — restaura via seed
- [x] Homelab: initContainer da api roda `migrate deploy` **e** o seed a cada rollout
- [x] Roadmap atualizado; notas de "adiado" resolvidas (fatia 3, ADRs 0003/0004 → ADR 0006)

## Como verificar

```bash
npm test
# produção (depois do deploy): editar um preço direto no banco e ver refletir em ~1min
kubectl -n postgres exec postgres-0 -- psql -U postgres -d churrasquin \
  -c "UPDATE \"CatalogItem\" SET \"unitPriceCents\"=9900 WHERE name='Picanha';"
# recarregar https://churrasqu.in → tela de padrões com o preço novo (e desfazer com o UPDATE inverso
# ou rodando o seed de novo no pod da api: node apps/api/prisma/seed.cjs)
```
