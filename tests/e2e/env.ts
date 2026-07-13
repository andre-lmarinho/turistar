import { resetSupabaseMock } from "./mocks/supabase";

const DEFAULT_E2E_ENV = {
  NEXT_PUBLIC_E2E: "1",
  NEXT_PUBLIC_SITE_URL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  GEOAPIFY_KEY: "test-key",
  NEXT_PUBLIC_PLANNER_INLINE_ADD: "1",
} as const;

export const applyE2EEnv = () => {
  for (const [key, value] of Object.entries(DEFAULT_E2E_ENV)) {
    if (typeof process.env[key] === "undefined") {
      process.env[key] = value;
    }
  }
};

applyE2EEnv();

if (process.env.NEXT_PUBLIC_E2E === "1") {
  resetSupabaseMock();
}

export type E2EEnvKey = keyof typeof DEFAULT_E2E_ENV;

export const getE2EEnv = (key: E2EEnvKey) => process.env[key] ?? DEFAULT_E2E_ENV[key];
