import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { defaultCache } from '@serwist/next/worker';
import { NetworkFirst, NetworkOnly, Serwist } from 'serwist';

// Service worker do PWA (ADR 0007). Compilado pelo @serwist/next para public/sw.js.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // versão nova assume na próxima navegação — deploy frequente sem toast (ADR 0007)
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // convite público e catálogo funcionam offline depois de visitados
      matcher: ({ url, sameOrigin }) => sameOrigin && /^\/api\/(catalog|public)\//.test(url.pathname),
      handler: new NetworkFirst({ cacheName: 'api-publica', networkTimeoutSeconds: 5 }),
    },
    {
      // o resto da API (auth, salvar, cobranças) NUNCA serve resposta velha
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/'),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
