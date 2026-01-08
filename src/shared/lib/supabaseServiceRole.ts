import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/shared/lib/clientEnv";
import type { Database } from "@/shared/types/supabase";

let serviceRoleClient: SupabaseClient<Database> | null = null;

export function createSupabaseServiceRoleClient(): SupabaseClient<Database> {
  const existingClient = serviceRoleClient;
  if (existingClient) {
    return existingClient;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for service role access.");
  }

  const client = createClient<Database>(clientEnv.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  serviceRoleClient = client;
  return client;
}
