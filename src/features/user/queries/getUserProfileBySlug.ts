import "server-only";

import type { UserProfileRecord } from "@/features/user/repositories/ProfileRepository";
import { fetchProfileBySlug } from "@/features/user/repositories/ProfileRepository";

export async function getUserProfileBySlug(slug: string): Promise<UserProfileRecord | null> {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return null;
  }

  return fetchProfileBySlug(normalizedSlug);
}
