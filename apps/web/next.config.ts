import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

// Service worker do PWA (ADR 0007): compilado no build, desligado em dev.
// A revision muda a cada build para o documento /~offline ser re-precacheado.
const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
});

const nextConfig: NextConfig = {
  // Runtime mínimo autocontido para a imagem Docker (fatia 6)
  output: 'standalone',
  async redirects() {
    return [
      // rota antiga do convite; /ho/ lê "churrasquinho" (churrasqu.in + ho)
      { source: '/c/:slug', destination: '/ho/:slug', permanent: true },
    ];
  },
};

export default withSerwist(nextConfig);
