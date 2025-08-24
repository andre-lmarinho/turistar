// next.config.ts
import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /** Other Next.js options (keep any you already have) */
  reactStrictMode: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' }],
  },
  experimental: {
    /**
     * Route handlers are colocated in `src/server/api`.
     * This tells Next.js to resolve API routes from there directly,
     * removing the need for re-export files under `src/app/api`.
     */
    apiDir: path.resolve(__dirname, 'src/server/api'),
  } as unknown as NextConfig['experimental'],
  webpack: (config) => {
    config.resolve.alias['@api'] = path.resolve(__dirname, 'src/server/api');
    return config;
  },
  turbo: {
    resolveAlias: {
      '@api': path.resolve(__dirname, 'src/server/api'),
    },
  },
};

export default nextConfig;
