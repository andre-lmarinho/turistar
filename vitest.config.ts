// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@supabase/ssr': resolve(__dirname, 'src/__mocks__/supabaseSsr.ts'),
      '@supabase/auth-helpers-react': resolve(
        __dirname,
        'src/__mocks__/supabaseAuthHelpersReact.ts'
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.tsx',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
