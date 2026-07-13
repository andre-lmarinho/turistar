import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/supabase";
import { clientEnv } from "./clientEnv";

const isE2E = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_E2E === "1";

type SupabaseMockModule = typeof import("../../../tests/e2e/mocks/supabase");

function getE2ESupabaseClient(): SupabaseClient<Database> {
  const { getSupabaseMock } = require("../../../tests/e2e/mocks/supabase") as SupabaseMockModule;
  return getSupabaseMock();
}

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  return isE2E
    ? getE2ESupabaseClient()
    : createBrowserClient<Database>(
        clientEnv.NEXT_PUBLIC_SUPABASE_URL,
        clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
}

// Lazy singleton — avoids module-scope side effects that crash SSR.
// ponytail: global singleton, fine for browser auth client
let _supabase: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = createSupabaseBrowserClient();
  }
  return _supabase;
}
