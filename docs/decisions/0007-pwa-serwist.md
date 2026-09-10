# ADR 0007 — PWA com Serwist; atualização via skipWaiting

**Status:** aceito (fatia 9)

## Contexto

O app é um candidato natural a PWA: a calculadora roda 100% no cliente (pacote compartilhado) e o
catálogo tem fallback local — offline real depois do primeiro load. O Next não traz service worker
embutido; e SW mal configurado + deploy frequente (nossa esteira faz vários por dia) = usuário preso
em versão velha.

## Decisão

1. **Serwist** (`@serwist/next`) para o service worker — sucessor mantido do next-pwa, Workbox por
   baixo, integração de primeira classe com App Router e `output: standalone`; SW compilado no build
   (`app/sw.ts` → `public/sw.js`), desabilitado em dev.
2. **Atualização agressiva**: `skipWaiting: true` + `clientsClaim: true` — a versão nova do SW assume
   na próxima navegação, sem toast de "recarregar". Trade-off aceito: uma aba aberta durante o deploy
   pode misturar assets por uma navegação; para um app de fluxo curto isso vale a simplicidade. Se
   incomodar, o refinamento futuro é o toast de reload.
3. **API nunca serve resposta velha em silêncio**: runtime cache explícito ANTES do default do
   Serwist — `/api/(catalog|public)` em `NetworkFirst` (útil offline: convite/preços já visitados),
   todo o resto de `/api/` em `NetworkOnly` (auth, salvar, cobranças). Assets/páginas seguem o
   `defaultCache` do Serwist.
4. **Manifest nativo do Next** (`app/manifest.ts`) e ícones derivados do `logo.png`: normal (fundo
   transparente ok) e **maskable** com ~20% de padding sobre cream; `apple-icon.png` 180px sólido.

## Consequências

- `public/sw.js` é artefato de build (gitignored); a imagem Docker o gera no `next build` — zero
  mudança no homelab.
- iOS instala só manualmente (Compartilhar → Tela de Início) e sem `beforeinstallprompt`; push em
  iOS só 16.4+ e para PWA instalada — Web Push inteiro fica para fatia própria.
- O SW cacheia documentos same-origin (defaultCache): logout não limpa páginas cacheadas do
  `/meus` — aceitável (mesmo perfil de browser); revisitar se virar dispositivo compartilhado.
