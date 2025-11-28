import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

type GetUserProfileBySlugOptions = {
  client?: SupabaseClient<Database>;
};

export type UserProfileRecord = {
  userId: string;
  slug: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export async function getUserProfileBySlug(
  slug: string,
  { client }: GetUserProfileBySlugOptions = {}
): Promise<UserProfileRecord | null> {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return null;
  }

  const supabase = client ?? createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, slug, display_name, avatar_url')
    .eq('slug', normalizedSlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    userId: data.id,
    slug: data.slug,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
  };
}
