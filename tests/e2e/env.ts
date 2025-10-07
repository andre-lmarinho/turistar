const DEFAULT_E2E_ENV = {
  NEXT_PUBLIC_E2E: '1',
  NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3100',
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  NEXT_PUBLIC_GEOAPIFY_KEY: 'test-key',
} as const;

export const applyE2EEnv = () => {
  for (const [key, value] of Object.entries(DEFAULT_E2E_ENV)) {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = value;
    }
  }
};

applyE2EEnv();

export type E2EEnvKey = keyof typeof DEFAULT_E2E_ENV;

export const getE2EEnv = (key: E2EEnvKey) => process.env[key] ?? DEFAULT_E2E_ENV[key];
