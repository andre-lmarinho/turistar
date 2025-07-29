// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /** Other Next.js options (keep any you already have) */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'i0.wp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'dynamic-media-cdn.tripadvisor.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media-cdn.tripadvisor.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.vamosparaitalia.com.br', pathname: '/**' },
    ],
  },
};

export default nextConfig;
