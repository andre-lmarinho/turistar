import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

export type UserProfileRecord = {
  userId: string;
  slug: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ProfileUpsertPayload = {
  userId: string;
  slug: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ProfileRepositoryError = {
  code?: string;
  message: string;
};

export type ProfileUpsertResult = {
  data: { slug: string } | null;
  error: ProfileRepositoryError | null;
};

type ProfileRepositoryOptions = {
  client?: SupabaseClient;
};

type ProfileRow = {
  id: string;
  slug: string;
  display_name: string | null;
  avatar_url: string | null;
};

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

function toProfileRepositoryError(error: unknown): ProfileRepositoryError {
  if (typeof error !== 'object' || error === null) {
    return { message: 'Supabase error' };
  }

  const maybeError = error as { code?: string; message?: string };

  return {
    code: typeof maybeError.code === 'string' ? maybeError.code : undefined,
    message: typeof maybeError.message === 'string' ? maybeError.message : 'Supabase error',
  };
}

export async function fetchProfileBySlug(
  slug: string,
  { client }: ProfileRepositoryOptions = {}
): Promise<UserProfileRecord | null> {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('profiles')
    .select('id, slug, display_name, avatar_url')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as ProfileRow;

  return {
    userId: row.id,
    slug: row.slug,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

export async function upsertProfile(
  { userId, slug, displayName, avatarUrl }: ProfileUpsertPayload,
  { client }: ProfileRepositoryOptions = {}
): Promise<ProfileUpsertResult> {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        slug,
        display_name: displayName,
        avatar_url: avatarUrl,
      },
      { onConflict: 'id' }
    )
    .select('slug')
    .single();

  if (error) {
    return { data: null, error: toProfileRepositoryError(error) };
  }

  return { data: data ? { slug: (data as { slug: string }).slug } : null, error: null };
}
