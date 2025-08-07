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
export const clientEnv = clientEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_GEOAPIFY_KEY: process.env.NEXT_PUBLIC_GEOAPIFY_KEY,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
