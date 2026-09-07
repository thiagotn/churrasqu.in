# ADR 0001 — npm workspaces como gerenciador do monorepo

**Status:** aceito (fatia 0)

## Contexto

O projeto é um monorepo (`apps/api`, `apps/web`, futuramente `packages/*`). pnpm não está instalado na máquina de desenvolvimento; npm 11 está disponível e suporta workspaces.

## Decisão

npm workspaces, sem ferramenta extra (Turborepo/Nx) enquanto o build for barato.

## Consequências

- Zero dependência global além do Node.
- Ordem de build entre workspaces é orquestrada nos scripts da raiz (npm não resolve grafo de build sozinho).
- Se o build ficar lento ou o grafo crescer, reavaliar Turborepo (drop-in sobre workspaces).
