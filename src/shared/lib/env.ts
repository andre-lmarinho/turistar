// src/shared/lib/env.ts

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);

type Env = z.infer<typeof envSchema>;
export type { Env };
