import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Runtime mínimo autocontido para a imagem Docker (fatia 6)
  output: 'standalone',
};

export default nextConfig;
