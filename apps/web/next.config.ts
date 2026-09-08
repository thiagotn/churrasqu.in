import type { NextConfig } from 'next';

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

export default nextConfig;
