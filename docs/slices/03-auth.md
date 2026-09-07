# Fatia 3 — Auth + persistência

**Status: TODO**

## Objetivo

Cadastro/login (tela 4 do handoff) e a primeira persistência real: salvar o churras (snapshot da lista) atrás de auth.

## Escopo previsto

- Banco PostgreSQL (docker compose para dev; k8s na fatia 6) + ORM — decidir Prisma vs TypeORM em ADR na abertura da fatia.
- Módulos `users` e `auth`: cadastro (nome, e-mail, senha ≥ 8, hash argon2/bcrypt), login, JWT + refresh, guards.
- Módulos `barbecues` (persistido) + `shopping-list`: `POST/GET/PATCH /barbecues` salvando **snapshot** dos itens (nome, unidade, qty, preço no momento) — preços de referência mudam, o evento salvo não.
- Migrar o seed de preços do código para tabela + seed do banco (`catalog`), mantendo `packages/calculator` como regra de cálculo pura.
- Front: tela 4 (tabs Criar conta / Já tenho conta, card azul de benefícios), estados de erro no padrão visual (borda ember + mensagem 13px/900), fluxo "Salvar e compartilhar" → auth → salvar → share.
- Validações do handoff: e-mail válido, senha ≥ 8, ao menos 1 adulto no save.

## Checklist

- [ ] ADR de persistência (ORM + estratégia dev/prod)
- [ ] docker-compose de dev com Postgres
- [ ] users + auth (JWT/refresh) com testes
- [ ] POST/GET/PATCH /barbecues com snapshot da lista
- [ ] Seed do catálogo no banco
- [ ] Tela 4 no front + integração do fluxo de salvar
- [ ] Roadmap atualizado + commit
