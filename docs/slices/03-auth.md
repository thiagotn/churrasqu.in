# Fatia 3 — Auth + persistência

**Status: DONE**

## Objetivo

Cadastro/login (tela 4 do handoff) e a primeira persistência real: salvar o churras (snapshot da lista) atrás de auth.

## Checklist

- [x] ADR de persistência: [0004 — Prisma + PostgreSQL](../decisions/0004-prisma-postgres.md)
- [x] `docker-compose.yml` com Postgres 16 (porta **5433** no host — a 5432 estava ocupada)
- [x] Schema Prisma (`User`, `Barbecue`, `BarbecueItem`) + migration `init`; dinheiro em centavos
- [x] Auth: signup (bcrypt), login, refresh; JWT 15min + refresh 30d; `JwtAuthGuard`
- [x] `POST/GET/PATCH /barbecues` com **snapshot** dos itens ativos (PATCH recalcula e mantém o slug)
- [x] Tela 4 no front (tabs, card de benefícios, erros no padrão visual) + fluxo salvar → auth → salvo
- [x] Sessão em `localStorage`; "Salvar e compartilhar" vira "Atualizar e compartilhar" após o 1º save
- [x] e2e: fluxo completo (signup/409/401, salvar, listar, PATCH, isolamento entre usuários) — 12 testes
- [x] Roadmap atualizado + commit

## Como verificar

```bash
docker compose up -d db        # obrigatório para os e2e e para a api
npm test                       # inclui os e2e de auth/barbecues
npm run dev:api & npm run dev:web
# fluxo no browser: lista → Salvar e compartilhar → criar conta → "Churras salvo!"
```

## Notas

- **Adiado:** migrar o seed do catálogo para o banco. O seed segue em `packages/calculator` (ADR 0003/0004) até haver necessidade real de administrar preços; quando entrar, vira tabela + seed do Prisma e o `calculate` ganha catálogo injetável.
- Não há módulo `users` separado: o modelo `User` é pequeno e vive no `auth`; separa-se quando ganhar perfil/preferências.
- A tela "Churras salvo!" é um recorte da tela 5 — QR, Pix e dados do evento completam na fatia 4.
