import "server-only";

import type { SetAllCookies } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import type { Database } from "@/shared/types/supabase";
import { clientEnv } from "./clientEnv";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type HeaderStore = Awaited<ReturnType<typeof headers>>;
type CookieBatch = Parameters<SetAllCookies>[0];

const isE2E = process.env.NEXT_PUBLIC_E2E === "1";

type SupabaseMockModule = typeof import("../../../tests/e2e/mocks/supabase");

function getE2ESupabaseClient(): SupabaseClient<Database> {
  const { getSupabaseMock } = require("../../../tests/e2e/mocks/supabase") as SupabaseMockModule;
  return getSupabaseMock();
}

export function createSupabaseServerClient(): SupabaseClient<Database> {
  if (isE2E) {
    return getE2ESupabaseClient();
  }

  const cookieStorePromise = cookies();
  const headersListPromise = headers();

  const client = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          const cookieStore: CookieStore = await cookieStorePromise;
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet: CookieBatch) {
          const cookieStore: CookieStore = await cookieStorePromise;
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
      headers: {
        async get(key: string) {
          const headersList: HeaderStore = await headersListPromise;
          return headersList.get(key) ?? undefined;
        },
      },
    } as Parameters<typeof createServerClient<Database>>[2] & {
      headers: {
        get(key: string): string | null | undefined | Promise<string | null | undefined>;
      };
    }
  );

  return client;
}

export function supabaseServer() {
  return createSupabaseServerClient();
}
