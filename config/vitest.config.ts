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
      '@': resolve(__dirname, '../src'),
      '@supabase/ssr': resolve(__dirname, '../src/__mocks__/supabaseSsr.ts'),
      '@/app/globals.css': resolve(__dirname, '../src/__mocks__/empty.css'),
      'leaflet/dist/leaflet.css': resolve(__dirname, '../src/__mocks__/empty.css'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: resolve(__dirname, 'vitest.setup.tsx'),
    include: ['tests/{unit,integration}/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: resolve(__dirname, '../coverage'),
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 40,
        lines: 50,
      },
    },
  },
});
