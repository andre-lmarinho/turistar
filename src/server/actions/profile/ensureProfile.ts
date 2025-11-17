'use server';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import slugify from '@sindresorhus/slugify';

import { UnauthorizedError } from '@/shared/lib/auth/session';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import type { Database } from '@/shared/types/supabase';

const MAX_SLUG_ATTEMPTS = 10;

type EnsureProfileOptions = {
  client?: SupabaseClient<Database>;
};

type ProfileUpsertPayload = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  baseSlug: string;
};

export async function ensureProfile({ client }: EnsureProfileOptions = {}): Promise<string> {
  const supabase = client ?? createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new UnauthorizedError();
  }

  const payload: ProfileUpsertPayload = {
    id: user.id,
    displayName: extractDisplayName(user),
    avatarUrl: extractAvatarUrl(user),
    baseSlug: buildSlugBase(user),
  };

  return upsertProfileWithUniqueSlug(supabase, payload);
}

function extractDisplayName(user: User): string | null {
  const metadata = user.user_metadata as Record<string, unknown> | null;
  const candidate =
    readMetadataString(metadata, 'full_name') ??
    readMetadataString(metadata, 'name') ??
    readMetadataString(metadata, 'user_name') ??
    readMetadataString(metadata, 'username');

  if (candidate) {
    return candidate;
  }

  const emailPrefix = user.email?.split('@')[0];

  return typeof emailPrefix === 'string' && emailPrefix.length > 0 ? emailPrefix : null;
}

function extractAvatarUrl(user: User): string | null {
  const metadata = user.user_metadata as Record<string, unknown> | null;

  return readMetadataString(metadata, 'avatar_url');
}

function buildSlugBase(user: User): string {
  const metadata = user.user_metadata as Record<string, unknown> | null;
  const slugCandidate =
    readMetadataString(metadata, 'username') ??
    readMetadataString(metadata, 'user_name') ??
    readMetadataString(metadata, 'preferred_username') ??
    readMetadataString(metadata, 'full_name') ??
    (user.email ? user.email.split('@')[0] : null) ??
    user.id;

  return slugify(slugCandidate, { separator: '-', lowercase: true }) || slugify(user.id, { separator: '-', lowercase: true });
}

function readMetadataString(metadata: Record<string, unknown> | null, key: string): string | null {
  if (!metadata) {
    return null;
  }

  const value = metadata[key as keyof typeof metadata];

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

async function upsertProfileWithUniqueSlug(
  supabase: SupabaseClient<Database>,
  { id, displayName, avatarUrl, baseSlug }: ProfileUpsertPayload
): Promise<string> {
  const sanitizedBase = baseSlug || slugify(id, { separator: '-', lowercase: true });

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidateSlug = attempt === 0 ? sanitizedBase : `${sanitizedBase}-${attempt}`;
    const response = await supabase
      .from('profiles')
      .upsert(
        {
          id,
          slug: candidateSlug,
          display_name: displayName,
          avatar_url: avatarUrl,
        },
        { onConflict: 'id' }
      )
      .select('slug')
      .single();

    if (!response.error && response.data) {
      return response.data.slug;
    }

    if (response.error?.code === '23505') {
      continue;
    }

    throw response.error ?? new Error('Failed to upsert profile');
  }

  throw new Error('Unable to allocate a unique slug for the profile');
}
