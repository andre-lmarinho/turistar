// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Other Next.js options (keep any you already have) */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
