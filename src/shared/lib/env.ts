// src/lib/env.ts

const vars = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  GEOAPIFY_KEY: process.env.GEOAPIFY_KEY,
};

for (const [key, value] of Object.entries(vars)) {
  if (!value) throw new Error(`Missing environment variable: ${key}`);
}

export const env = vars as {
  NODE_ENV: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  GEOAPIFY_KEY: string;
};
