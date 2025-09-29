// tests/unit/shared/lib/clientEnv.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = process.env;

describe('clientEnv', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    vi.resetModules();
    process.env = ORIGINAL_ENV;
  });

  it('uses fallback values when CI is enabled via truthy string', async () => {
    process.env.CI = '1';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
    delete process.env.NEXT_PUBLIC_WIKIMEDIA_ENRICHMENT;

    const { clientEnv } = await import('@/shared/lib/clientEnv');

    expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBe('http://localhost:54321');
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('anon');
    expect(clientEnv.NEXT_PUBLIC_GEOAPIFY_KEY).toBe('test-key');
    expect(clientEnv.NEXT_PUBLIC_WIKIMEDIA_ENRICHMENT).toBe(true);
  });
});
