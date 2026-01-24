import "server-only";

import { fetchProfileBySlug } from "../repositories/ProfileRepository";
import type { ProfileRecord } from "../types";

export async function getProfileBySlug(slug: string): Promise<ProfileRecord | null> {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  return fetchProfileBySlug(normalizedSlug);
}
