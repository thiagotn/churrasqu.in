# ADR 0004 — Prisma + PostgreSQL (compose no dev, cluster no prod)

**Status:** aceito (fatia 3)

## Contexto

A fatia 3 introduz persistência (users, barbecues salvos com snapshot da lista). O handoff sugere "Prisma/TypeORM + PostgreSQL" e o deploy alvo é o k8s do homelab. Docker está disponível na máquina de dev.

## Decisão

- **PostgreSQL** em todos os ambientes: `docker compose up -d db` no dev; no cluster, decidido na fatia 6.
- **Prisma** como ORM: schema declarativo, migrations versionadas (`prisma/migrations`), tipagem gerada.
- **Dinheiro em centavos (`Int`)** no banco; a API fala em reais (number) nas bordas.
- **Snapshot:** o barbecue salvo guarda os itens ativos completos (nome, categoria, unidade, qty, preço no momento). Preços de referência podem mudar; o evento salvo não muda.
- Auth stateless: JWT de acesso (15 min) + refresh (30 dias), sem armazenamento de sessão.

## Consequências

- e2e de auth/barbecues exigem o Postgres do compose de pé (documentado na fatia 3).
- Migrar o **seed do catálogo** para o banco ficou **adiado**: o seed continua em `packages/calculator` (ADR 0003) até existir tela/necessidade de administrar preços — anotado na doc da fatia 3.
- Trocar de ORM depois custa caro; aceito, Prisma cobre o escopo previsto (CRUD + migrations + seed).
