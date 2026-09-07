# ADR 0005 — Deploy com manifests puros + kustomize (sem Helm)

**Status:** aceito (fatia 6)

## Contexto

Alvo é um cluster k8s de homelab com um único ambiente. O handoff sugeria "manifests/Helm chart".

## Decisão

- **Manifests YAML puros + `kustomization.yaml`** em `deploy/k8s/` — um ambiente só não justifica templating de Helm; o transformer `images:` do kustomize resolve registry/tag.
- **Postgres no cluster** como StatefulSet de 1 réplica com PVC (5Gi) — suficiente para homelab; backup/replicação são problema do dono do cluster, não do chart.
- **Migrations como initContainer** do Deployment da api (`prisma migrate deploy`, idempotente) — sem Job separado para não coordenar ordem de apply. Para isso, `prisma` (CLI) é dependência de produção da api.
- **Um Ingress único** (`churrasqu.in`): `/api` → api, `/` → web; TLS via cert-manager (`ClusterIssuer` `letsencrypt` pressuposto no cluster).
- **`NEXT_PUBLIC_API_URL=/api` em build** da imagem web (ARG) — front e api atrás do mesmo host.

## Consequências

- Multi-ambiente no futuro = overlays do kustomize (base + patches), sem reescrever nada.
- 2+ réplicas de api rodam `migrate deploy` concorrentes num rollout; o advisory lock do Prisma serializa — aceito.
- Imagens são construídas da raiz do monorepo (`docker build -f apps/<app>/Dockerfile .`).
