# ADR 0003 — Domínio do calculator em pacote compartilhado

**Status:** aceito (fatia 1)

## Contexto

O handoff exige que steppers, chips e edições **recalculem tudo instantaneamente** no front (telas 1–3), e que o backend seja o dono das regras (`POST /barbecues/estimate`, totais persistidos). Chamar a API a cada tecla adicionaria latência e estado de loading que o design não prevê; duplicar as regras em TypeScript no front garantiria divergência.

## Decisão

O domínio puro (tipos, catálogo/seed, cálculo, slug) vive em `packages/calculator` (`@churrasquin/calculator`), sem nenhuma dependência. `apps/api` (módulo NestJS `calculator`) e `apps/web` importam o mesmo pacote.

## Consequências

- Uma única fonte das regras; front recalcula localmente, backend valida/persiste com o mesmo código.
- Os testes do domínio moram no pacote; a api testa a casca (DI, DTOs, HTTP).
- O pacote compila para `dist/` (CJS + d.ts); scripts da raiz garantem `build` do pacote antes de testar/buildar os apps.
- Preços de referência dentro do pacote são o **seed**; quando o banco entrar (fatia 3), o pacote passa a receber o catálogo como parâmetro e o seed migra para o banco — a assinatura `calculate(input, adjustments)` ganha uma fonte de catálogo injetável. **(Feito na fatia 8 — ADR 0006.)**
