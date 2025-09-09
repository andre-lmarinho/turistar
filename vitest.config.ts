// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@supabase/ssr': resolve(__dirname, 'src/__mocks__/supabaseSsr.ts'),
      '@/features/home/components/feature-preview/styles.css': resolve(
        __dirname,
        'src/__mocks__/empty.css'
      ),
      '@/app/globals.css': resolve(__dirname, 'src/__mocks__/empty.css'),
      'leaflet/dist/leaflet.css': resolve(__dirname, 'src/__mocks__/empty.css'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.tsx',
    include: ['tests/{unit,integration}/**/*.{test,spec}.{ts,tsx}'],
  },
});
