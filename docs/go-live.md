# Go-live — dependências pendentes (checklist de referência)

> Atualizado em 2026-09-08 (4ª revisão). **🎉 NO AR — A–G concluídos.** DNS criado pelo dash
> (CNAME proxied → `<tunnel-id>.cfargotunnel.com` para root e www). Gotcha do G: regra nova no túnel
> exige `kubectl -n cloudflared rollout restart deploy/cloudflared` (ConfigMap não recarrega — sem isso,
> 404 vazio do catch-all; documentado no README do cloudflared no homelab). Smoke test completo em
> produção ok: home, signup, salvar (churras-de-estreia-b1c3), convite público com payload Pix,
> QR PNG, RSVP e /ho/<slug>. Resta o **H** (opcional).

## A. CI write-back (GitHub)

- [x] **Gerar par de chaves SSH** para o CI escrever no homelab:
  ```bash
  ssh-keygen -t ed25519 -f /tmp/churrasquin-ci -N "" -C "churrasquin-ci-writeback"
  ```
- [x] **Chave pública** em `homelab` → *Settings → Deploy keys → Add deploy key* — cole
  `/tmp/churrasquin-ci.pub` e **marque "Allow write access"**.
- [x] **Chave privada** como secret do repo do app:
  ```bash
  gh secret set HOMELAB_DEPLOY_KEY --repo thiagotn/churrasqu.in < /tmp/churrasquin-ci
  ```
- [x] **Apagar as cópias locais**: `rm /tmp/churrasquin-ci /tmp/churrasquin-ci.pub`

## B. Packages GHCR públicos

O primeiro push criou `churrasquin-api` e `churrasquin-web` como **privados**; a ADR 0008 assume
públicos (o cluster não tem `imagePullSecret`).

- [x] `github.com/users/thiagotn/packages/container/churrasquin-api/settings` → *Change visibility* → **Public**
- [x] Idem para `churrasquin-web`

## C. Push do homelab

⚠️ Push no homelab **é deploy** (Argo com selfHeal). Neste caso é seguro: as regras novas do túnel são
inertes sem DNS e o app só entra no cluster no passo F.6.

- [x] `cd ../homelab && git push` (leva o commit `e97a1c9` — manifests + ADR 0008)

## D. Fechar o ciclo do CI

- [x] Re-rodar o write-back: `gh run rerun 34153758570 --failed --repo thiagotn/churrasqu.in`
  (ou qualquer push na main)
- [x] Conferir no homelab o commit `deploy(churrasquin): sha-…` e o `<sha>` no
  `helm/apps/churrasquin/kustomization.yaml` (substituindo o `latest` provisório)

## E. Cloudflare

- [x] **Zona `churrasqu.in` ativa** na conta (domínio registrado + nameservers da Cloudflare)
- [x] **Token do cert-manager cobre a zona nova**: o secret `cloudflare-api-token` (DNS-01) precisa de
  `Zone:DNS:Edit` na zona `churrasqu.in` — token por conta já cobre; token por zona, estender/recriar

## F. Cluster (no node, via mesh/LAN) — ordem da ADR 0008 do homelab

- [x] 1. Senha do role no Postgres compartilhado:
  ```bash
  kubectl create secret generic churrasquin-db-init -n postgres \
    --from-literal=password="$(openssl rand -hex 24)"
  ```
- [x] 2. Provisionar database + role (Job idempotente, se autolimpa):
  ```bash
  kubectl apply -f helm/postgres/app-db-churrasquin.yml
  kubectl -n postgres wait --for=condition=complete job/db-init-churrasquin --timeout=120s
  ```
- [x] 3. `kubectl apply -f helm/apps/churrasquin/namespace.yml`
- [x] 4. Secret do banco no ns do app (mesma senha do passo 1):
  ```bash
  kubectl create secret generic churrasquin-db -n churrasquin \
    --from-literal=DATABASE_URL="postgresql://churrasquin:<SENHA>@postgres.postgres.svc.cluster.local:5432/churrasquin"
  ```
- [x] 5. Secret da api:
  ```bash
  kubectl create secret generic churrasquin-api -n churrasquin \
    --from-literal=JWT_SECRET="$(openssl rand -hex 32)"
  ```
- [x] 6. Argo assume o app:
  ```bash
  kubectl apply -f helm/argocd/application-churrasquin.yml
  kubectl -n argocd get app churrasquin   # quer Synced / Healthy
  ```
- [x] 7. Validar por dentro antes do DNS (o node não resolve `*.svc.cluster.local` — use ClusterIP):
  ```bash
  API_IP=$(kubectl -n churrasquin get svc churrasquin-api -o jsonpath='{.spec.clusterIP}')
  curl -s http://$API_IP:3001/api/health   # espera {"status":"ok",...}
  ```

## G. DNS pelo túnel (último passo — vira a chave)

- [x] ```bash
  cloudflared tunnel route dns --overwrite-dns 2c96e043-273e-4cf3-b0dd-479cceb1b357 churrasqu.in
  cloudflared tunnel route dns --overwrite-dns 2c96e043-273e-4cf3-b0dd-479cceb1b357 www.churrasqu.in
  ```
- [x] Smoke test público: `https://churrasqu.in` (fluxo setup → lista), `https://churrasqu.in/api/health`,
  salvar um churras e abrir `/ho/<slug>` (QR/Pix/RSVP; `/c/<slug>` antigo redireciona 308)

## H. Pós-go-live (sem pressa)

- [ ] Card no Homepage aparece sozinho (annotations do Ingress) — conferir
- [ ] Logs no Grafana/Loki (Alloy coleta sozinho) — conferir
- [ ] Futuro: expor `/metrics` na api + ServiceMonitor/dashboard (mesmo plug do rachao)
- [ ] Futuro: descrição + topics no repo GitHub

## Dependências entre os passos

```
A ─┐
B ─┼─→ D (CI fecha o ciclo)     E ──→ G
C ─┘        C ──→ F (1–7) ──────────→ G
```

A/B/C são independentes entre si; D precisa dos três; F precisa de C (manifests no GitHub… na verdade
F usa os arquivos locais do homelab — precisa apenas do repo homelab atualizado na máquina onde rodar);
G é o último e precisa de E + F saudável (e de D para a imagem certa estar no ar).
