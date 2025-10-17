declare module '@next/mdx' {
  import type { NextConfig } from 'next';

  export interface CreateMDXOptions {
    extension?: RegExp | RegExp[];
    options?: Record<string, unknown>;
  }

  export default function createMDX(options?: CreateMDXOptions): (nextConfig: NextConfig) => NextConfig;
}

declare module '@radix-ui/react-navigation-menu';
