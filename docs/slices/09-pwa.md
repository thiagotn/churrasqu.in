# Fatia 9 — PWA (instalável + offline)

**Status: DONE** — ver [ADR 0007](../decisions/0007-pwa-serwist.md).

## Objetivo

Tornar o churrasqu.in instalável (Android com prompt; iOS via "Adicionar à Tela de Início") e
funcional offline no que é client-side: a calculadora inteira roda no `packages/calculator`, então
montar churras e editar lista funcionam sem rede depois do primeiro carregamento (o catálogo tem
fallback do pacote). Salvar/login/convite/RSVP continuam exigindo rede, como devem.

## Escopo

- **Manifest** via `app/manifest.ts` (suporte nativo do Next): `display: standalone`, cores da marca,
  `lang: pt-BR`, ícones 192/512 + **maskable** (o logo tem fundo transparente e encosta nas bordas —
  a variante maskable ganha padding sobre fundo cream para não ser cortada no círculo do Android).
- **Ícones** gerados a partir de `assets/logo.png` (PIL): `public/icons/*` + `app/apple-icon.png`
  (180px, fundo sólido — iOS não lida bem com transparência).
- **Service worker com Serwist** (`@serwist/next`, sucessor do next-pwa): precache do app shell,
  página offline (`/~offline`), runtime cache com regra explícita para a API — `NetworkOnly` por
  default, `NetworkFirst` só para `GET /api/catalog|public` (convite consultável offline após visita).
- **Atualização**: `skipWaiting + clientsClaim` — versão nova assume na próxima navegação, sem toast
  (combina com a esteira de deploy frequente); ver trade-off no ADR.
- **iOS**: `apple-touch-icon` + metadata `appleWebApp`; sem prompt de instalação (limitação da
  plataforma — documentado).

**Fora de escopo:** Web Push (fatia futura; VAPID no NestJS), botão de instalação próprio
(`beforeinstallprompt`), tela de onboarding do app instalado.

## Checklist

- [x] `app/manifest.ts` + ícones (192/512 normal e maskable, apple-icon 180)
- [x] Serwist: `next.config.ts` (swSrc/swDest, desligado em dev), `app/sw.ts`, página `/~offline`
- [x] Runtime cache: API `NetworkOnly` exceto `catalog|public` (`NetworkFirst`)
- [x] `.gitignore`: `sw.js` gerado no build
- [x] Validação local (Chrome headless): manifest servido, SW registrado/ativo, **reload offline**
      servindo o app shell e navegação offline caindo no fallback
- [x] Deploy pela esteira + verificação em produção (manifest e sw.js com 200; instalação real fica
      com o usuário no Android)
- [x] Validado headless: SW `active+controlled`, reload offline da home com app shell, calculadora
      navegável offline, rota não visitada caindo no fallback `/~offline`
- [x] Roadmap atualizado + commit

## Como verificar

```bash
npm run build --workspace=apps/web && (cd apps/web && npx next start)
# Chrome: DevTools → Application → Manifest (sem erros) e Service Workers (activated)
# aba Network "Offline" → recarregar: app shell continua; calculadora funciona
# produção: https://churrasqu.in/manifest.webmanifest e /sw.js → 200
# Android: Chrome deve oferecer "Adicionar à tela inicial" (ou menu ⋮ → Instalar app)
```
