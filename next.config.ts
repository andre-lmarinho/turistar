// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /** Other Next.js options (keep any you already have) */
  reactStrictMode: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' }],
  },
};

export default nextConfig;
