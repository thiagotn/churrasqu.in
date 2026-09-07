# churrasqu.in

Calculadora de churrasco: quem vai, quanto custa, lista de compras por nível ($, $$, $$$), link público de convite com QR Code e Pix (BR Code EMV) para rateio, e RSVP sem cadastro para os convidados.

**Stack:** NestJS 11 + Prisma/PostgreSQL (api) · Next.js 15 + Tailwind v4 (web) · domínio de cálculo puro compartilhado em um pacote TypeScript sem dependências.

## Estrutura

```
apps/api              # NestJS — REST, auth JWT, persistência (snapshot), Pix/QR, RSVP
apps/web              # Next.js (App Router) + Tailwind v4 — UI hifi do handoff
packages/calculator   # Domínio puro compartilhado (regras de cálculo, catálogo seed, slug)
deploy/k8s            # Manifests genéricos (referência) — o deploy real vive no repo `homelab`
docs/                 # Roadmap de fatias (TODO/WIP/DONE), docs por fatia e ADRs
design_handoff_churrasquin/  # Handoff de design (spec de UI e regras)
```

**Em qual passo estamos?** → [`docs/roadmap.md`](./docs/roadmap.md)

## Pré-requisitos

- Node.js 22 (`.nvmrc`)
- Docker (Postgres de dev via compose; a porta do host é **5433**)

## Comandos (raiz)

```bash
npm install            # tudo (workspaces)
docker compose up -d db  # Postgres de dev (obrigatório p/ api e e2e)
cp apps/api/.env.example apps/api/.env
npm test               # domínio + api (unit e e2e) — 72 testes
npm run dev:api        # NestJS em :3001 (prefixo /api)
npm run dev:web        # Next.js em :3000
npm run build          # pacote + api + web
```

## Deploy

Imagens Docker multi-stage em `apps/*/Dockerfile` (build a partir da raiz). Os manifests em `deploy/k8s`
são a referência genérica; o deploy de produção (k3s single-node, Postgres compartilhado, Cloudflare
Tunnel, GitOps via Argo CD) vive no repo `homelab` — ver a nota em
[`docs/slices/06-deploy-k8s.md`](./docs/slices/06-deploy-k8s.md).

## Licença

[MIT](./LICENSE). As imagens em `design_handoff_churrasquin/assets` e `apps/web/public/assets` foram
geradas por IA para a identidade visual do projeto.
