import "server-only";

import { fetchProfileBySlug } from "@/features/app/user/server/repositories/ProfileRepository";
import { validUsername } from "@/features/auth/utils/validUsername";
import { createSupabaseServiceRoleClient } from "@/shared/lib/supabaseServiceRole";

export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!validUsername(username)) {
    return false;
  }

  const supabase = createSupabaseServiceRoleClient();
  const profile = await fetchProfileBySlug(username, { client: supabase });
  return !profile;
}
