// src/shared/lib/env.ts

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  GEOAPIFY_KEY: z.string(),
});

export const env = envSchema.parse(process.env);

type Env = z.infer<typeof envSchema>;
export type { Env };
