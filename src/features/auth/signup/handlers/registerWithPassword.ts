import type { AuthResponse } from "@supabase/auth-js";
import type { Session } from "@supabase/supabase-js";

import { syncServerSession } from "@/shared/lib/auth/sync-server-session";
import { supabase } from "@/shared/lib/supabaseClient";

import type { RegisterWithPasswordInput, RegisterWithPasswordResult } from "../types";
import { normalizeSignupCredentials } from "../utils/normalizeCredentials";

export async function registerWithPassword({
  email,
  password,
  finalizeProfile,
  emailRedirectTo,
}: RegisterWithPasswordInput): Promise<RegisterWithPasswordResult> {
  const normalized = normalizeSignupCredentials({ email, password });

  const { data, error } = (await supabase.auth.signUp({
    email: normalized.email,
    password: normalized.password,
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
  })) as AuthResponse;

  if (error) {
    throw new Error(`registerWithPassword failed: message=${error.message}`);
  }

  const session: Session | null = data.session ?? null;

  if (!session) {
    return { status: "needs-confirmation" };
  }

  await syncServerSession("SIGNED_IN", session);

  const slug = await finalizeProfile();

  return { status: "signed-in", slug };
}
