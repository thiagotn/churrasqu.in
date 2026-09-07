# Roadmap de fatias

> Fatia atual: **4 — Sharing: slug, QR, Pix** (`WIP`)

| # | Fatia | Status | Doc | Entrega |
|---|---|---|---|---|
| 0 | Fundação: monorepo + calculator puro com testes | `DONE` | [slices/00-fundacao.md](./slices/00-fundacao.md) | Domínio do cálculo portado do protótipo, 36 testes |
| 1 | Catálogo e seed de preços + API de estimativa | `DONE` | [slices/01-catalogo-seed.md](./slices/01-catalogo-seed.md) | `GET /catalog/tiers`, `POST /barbecues/estimate`, pacote compartilhado |
| 2 | Telas 1–3 no front (Setup, Nível, Lista) | `DONE` | [slices/02-telas-1-3.md](./slices/02-telas-1-3.md) | UI hifi com recálculo instantâneo |
| 3 | Auth (cadastro/login) + persistência | `DONE` | [slices/03-auth.md](./slices/03-auth.md) | JWT, users, banco + salvar churras |
| 4 | Sharing: slug, link público, QR Code, Pix | `WIP` | [slices/04-sharing.md](./slices/04-sharing.md) | Telas 4–6, payload Pix EMV, página pública |
| 5 | RSVP na página pública | `TODO` | [slices/05-rsvp.md](./slices/05-rsvp.md) | Confirmação de presença + lista de confirmados |
| 6 | Docker + manifests k8s (homelab) | `TODO` | [slices/06-deploy-k8s.md](./slices/06-deploy-k8s.md) | Dockerfiles multi-stage, manifests, probes, migrations |

## Regras de atualização

1. Ao **começar** uma fatia: status vira `WIP` aqui e o ponteiro "Fatia atual" muda.
2. Ao **terminar**: checklist da fatia todo `[x]`, status `DONE`, commit da fatia.
3. Descobertas que mudam fatias futuras são anotadas na doc da fatia afetada (seção "Notas"), não perdidas em conversa.
