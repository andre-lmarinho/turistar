import { getSupabaseBrowserClient } from "@/shared/lib/supabaseClient";

export type UpdatePasswordResult = { ok: true } | { ok: false; error: unknown };

export async function updatePassword(password: string): Promise<UpdatePasswordResult> {
  const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
  if (error) {
    return { ok: false, error };
  }
  return { ok: true };
}
