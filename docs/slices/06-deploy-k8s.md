# Fatia 6 — Docker + manifests k8s (homelab)

**Status: DONE**

## Objetivo

Deploy no cluster k8s do homelab conforme o handoff: um serviço por app, TLS em `churrasqu.in`.

## Checklist

- [x] `apps/api/Dockerfile` multi-stage (build na raiz do monorepo; Prisma Client musl copiado; imagem roda como `node`) — **testado**: container serve `/api/health` (db up), catálogo e roda `prisma migrate deploy`
- [x] `apps/web/Dockerfile` multi-stage com Next `output: standalone` (ARG `NEXT_PUBLIC_API_URL=/api`) — **testado**: container serve a home
- [x] `/health` com `@nestjs/terminus` (ping no Postgres)
- [x] Manifests em `deploy/k8s/` (kustomize): namespace, Postgres StatefulSet+PVC, api/web (Deployment + Service + HPA 2–4), Ingress TLS único — `kustomize build` validado — ver [ADR 0005](../decisions/0005-deploy-kustomize.md)
- [x] Migrations como initContainer (`prisma migrate deploy`)
- [x] `secret.example.yaml` + instruções (`kubectl create secret …`); secret real fora do git
- [x] Roadmap atualizado + commit

## Como fazer o deploy

```bash
# 1. build e push das imagens (troque o registry)
docker build -f apps/api/Dockerfile -t registry.seu-homelab/churrasquin-api:v0.1.0 .
docker build -f apps/web/Dockerfile -t registry.seu-homelab/churrasquin-web:v0.1.0 .
docker push registry.seu-homelab/churrasquin-api:v0.1.0
docker push registry.seu-homelab/churrasquin-web:v0.1.0

# 2. aponte o kustomize para as suas tags
cd deploy/k8s && kustomize edit set image \
  churrasquin-api=registry.seu-homelab/churrasquin-api:v0.1.0 \
  churrasquin-web=registry.seu-homelab/churrasquin-web:v0.1.0

# 3. secret real (uma vez) — veja secret.example.yaml
kubectl apply -f namespace.yaml
kubectl -n churrasquin create secret generic churrasquin-secrets --from-literal=...

# 4. aplica tudo
kubectl apply -k deploy/k8s
```

Pré-requisitos no cluster: ingress-nginx, cert-manager com `ClusterIssuer` chamado `letsencrypt`, metrics-server (para os HPAs), DNS de `churrasqu.in` apontando para o Ingress.

## Notas

- **⚠️ Deploy real no homelab (2026-09-08):** os manifests deste diretório (`deploy/k8s`) são a versão
  **genérica** e ficaram como referência. A verdade do deploy é o repo `homelab`:
  `helm/apps/churrasquin/` + `docs/adr/0008-churrasquin-no-homelab.md`, que adapta ao padrão do cluster —
  1 réplica sem HPA, **Postgres compartilhado** (sem StatefulSet próprio), Traefik + **Cloudflare Tunnel**
  (não ingress-nginx), GitOps via Argo CD com tags no kustomization. Os Dockerfiles daqui continuam sendo
  os oficiais (a ADR 0008 os consome via GHCR).
- CI de build/push das imagens fica como melhoria futura (não há remoto git configurado ainda); até lá o
  push é manual e o bump da tag é feito no kustomization do homelab.
