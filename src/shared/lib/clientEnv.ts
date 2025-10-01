// src/shared/lib/clientEnv.ts
import { z } from 'zod';

const clientEnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_GEOAPIFY_KEY: z.string(),
});

// Next.js replaces `process.env.NEXT_PUBLIC_*` at build time, but the
// `process.env` object itself is empty in the browser. Referencing each key
// explicitly ensures the values are inlined during compilation and available at runtime.
// In CI we allow safe placeholders so builds don't fail when secrets are absent.
// This affects only CI artifacts; dev/prod must still provide real values.
const CI_TRUTHY_VALUES = new Set(['true', '1', 'yes']);

const isTruthyCi = (value: unknown) => {
  if (typeof value !== 'string') return false;

  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue.length > 0 && CI_TRUTHY_VALUES.has(normalizedValue);
};

const IN_CI = isTruthyCi(process.env.CI);

const FALLBACKS = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  NEXT_PUBLIC_GEOAPIFY_KEY: 'test-key',
} as const;

export const clientEnv = clientEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    (IN_CI ? FALLBACKS.NEXT_PUBLIC_SUPABASE_URL : undefined),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    (IN_CI ? FALLBACKS.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined),
  NEXT_PUBLIC_GEOAPIFY_KEY:
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY ??
    (IN_CI ? FALLBACKS.NEXT_PUBLIC_GEOAPIFY_KEY : undefined),
});
