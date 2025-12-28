'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import slugify from '@sindresorhus/slugify';

import {
  UnauthorizedError,
  isAuthSessionMissingError,
  type SupabaseUser,
} from '@/shared/lib/auth/session';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

const MAX_SLUG_ATTEMPTS = 10;

type EnsureProfileOptions = {
  client?: SupabaseClient;
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
    if (isAuthSessionMissingError(error)) {
      throw new UnauthorizedError();
    }

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

function extractDisplayName(user: SupabaseUser): string | null {
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

function extractAvatarUrl(user: SupabaseUser): string | null {
  const metadata = user.user_metadata as Record<string, unknown> | null;

  return readMetadataString(metadata, 'avatar_url');
}

function buildSlugBase(user: SupabaseUser): string {
  const metadata = user.user_metadata as Record<string, unknown> | null;
  const slugCandidate =
    readMetadataString(metadata, 'username') ??
    readMetadataString(metadata, 'user_name') ??
    readMetadataString(metadata, 'preferred_username') ??
    readMetadataString(metadata, 'full_name') ??
    (user.email ? user.email.split('@')[0] : null) ??
    user.id;

  return (
    slugify(slugCandidate, { separator: '-', lowercase: true }) ||
    slugify(user.id, { separator: '-', lowercase: true })
  );
}

function readMetadataString(metadata: Record<string, unknown> | null, key: string): string | null {
  if (!metadata) {
    return null;
  }

  const value = metadata[key as keyof typeof metadata];

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

async function upsertProfileWithUniqueSlug(
  supabase: SupabaseClient,
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

    const upsertError = (response.error as { code?: string } | null) ?? null;

    if (!upsertError && response.data) {
      return response.data.slug;
    }

    if (upsertError?.code === '23505') {
      continue;
    }

    throw upsertError ?? new Error('Failed to upsert profile');
  }

  throw new Error('Unable to allocate a unique slug for the profile');
}
