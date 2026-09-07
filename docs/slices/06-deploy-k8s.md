# Fatia 6 — Docker + manifests k8s (homelab)

**Status: TODO**

## Objetivo

Deploy no cluster k8s do homelab conforme o handoff: um serviço por app, TLS em `churrasqu.in`.

## Escopo previsto

- Dockerfile multi-stage por app (api e web), builds a partir da raiz do monorepo (workspaces).
- Manifests (ou Helm chart — decidir em ADR): Deployment + Service + Ingress (TLS), HPA, ConfigMap/Secret para env.
- Probes em `/health` com `@nestjs/terminus` na api.
- Migrations do banco como Job/initContainer.
- Postgres: definir se roda no cluster (StatefulSet) ou fora — decidir com o dono do homelab.

## Checklist

- [ ] Dockerfiles multi-stage (api, web) buildando localmente
- [ ] `@nestjs/terminus` + `/health`
- [ ] Manifests/chart com Ingress TLS, HPA, ConfigMap/Secret
- [ ] Job/initContainer de migrations
- [ ] Doc de deploy (como aplicar no cluster)
- [ ] Roadmap atualizado + commit
