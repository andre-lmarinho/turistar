// next.config.ts
import type { NextConfig } from 'next';
import getSecurityHeaders from './config/securityHeaders';

const nextConfig: NextConfig = {
  // Strengthen defaults for production readiness
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' }],
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders(isDev),
      },
      // Aggressive caching for static assets
      {
        source: '/:all*(js|css|png|jpg|jpeg|gif|webp|ico|svg|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
