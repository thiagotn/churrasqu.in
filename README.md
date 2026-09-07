# churrasqu.in

Calculadora de churrasco: quem vai, quanto custa, lista de compras por nível ($, $$, $$$), link público com QR Code e Pix para rateio.

## Estrutura

```
apps/api              # NestJS — REST, auth, persistência
apps/web              # Next.js (App Router) + Tailwind v4 — UI hifi do handoff
packages/calculator   # Domínio puro compartilhado (regras de cálculo, catálogo seed, slug)
docs/                 # Roadmap de fatias (TODO/WIP/DONE), docs por fatia e ADRs
design_handoff_churrasquin/  # Handoff de design (spec de UI e regras) — leitura obrigatória
```

**Em qual passo estamos?** → [`docs/roadmap.md`](./docs/roadmap.md)

## Comandos (raiz)

```bash
npm install        # tudo (workspaces)
npm test           # domínio + api (unit e e2e)
npm run dev:api    # NestJS em :3001 (prefixo /api)
npm run dev:web    # Next.js em :3000
npm run build      # pacote + api + web
```
