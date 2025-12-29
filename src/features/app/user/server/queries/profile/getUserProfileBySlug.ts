import 'server-only';

import { fetchProfileBySlug } from '@/features/app/user/server/repositories/ProfileRepository';
import type { UserProfileRecord } from '@/features/app/user/server/repositories/ProfileRepository';

export async function getUserProfileBySlug(
  slug: string
): Promise<UserProfileRecord | null> {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return null;
  }

  return fetchProfileBySlug(normalizedSlug);
}
