// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@supabase/ssr': resolve(__dirname, 'src/__mocks__/supabaseSsr.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.tsx',
    include: ['tests/{unit,integration}/**/*.{test,spec}.{ts,tsx}'],
  },
});
