// next.config.ts
import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import getSecurityHeaders from './securityHeaders';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  // Strengthen defaults for production readiness
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'i.pravatar.cc', pathname: '/**' }],
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    // Middleware now sets Content-Security-Policy with a per-request nonce.
    // Filter CSP out from static headers to avoid duplicates.
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders(isDev).filter((h) => h.key !== 'Content-Security-Policy'),
      },
      // Aggressive caching for static assets
      {
        source: '/:all*(js|css|png|jpg|jpeg|gif|webp|ico|svg|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default withMDX(nextConfig);
