'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import slugify from '@sindresorhus/slugify';

import { requireUser } from '@/shared/lib/auth/session';
import type { SupabaseUser } from '@/shared/lib/auth/session';
import { upsertProfile } from '@/features/app/user/server/repositories/ProfileRepository';
import type { ProfileUpsertResult } from '@/features/app/user/server/repositories/ProfileRepository';

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
  const user = await requireUser();

  const payload: ProfileUpsertPayload = {
    id: user.id,
    displayName: extractDisplayName(user),
    avatarUrl: extractAvatarUrl(user),
    baseSlug: buildSlugBase(user),
  };

  return upsertProfileWithUniqueSlug(payload, client);
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
  { id, displayName, avatarUrl, baseSlug }: ProfileUpsertPayload,
  client?: SupabaseClient
): Promise<string> {
  const sanitizedBase = baseSlug || slugify(id, { separator: '-', lowercase: true });

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidateSlug = attempt === 0 ? sanitizedBase : `${sanitizedBase}-${attempt}`;
    const response = await upsertProfile(
      {
        userId: id,
        slug: candidateSlug,
        displayName,
        avatarUrl,
      },
      { client }
    );
    const upsertError = response.error;

    if (!upsertError && response.data?.slug) {
      return response.data.slug;
    }

    if (upsertError?.code === '23505') {
      continue;
    }

    throw buildProfileUpsertError({
      userId: id,
      slug: candidateSlug,
      response,
    });
  }

  throw new Error(`Unable to allocate a unique slug for the profile: userId=${id}`);
}

type BuildProfileUpsertErrorParams = {
  userId: string;
  slug: string;
  response: ProfileUpsertResult;
};

function buildProfileUpsertError({
  userId,
  slug,
  response,
}: BuildProfileUpsertErrorParams): Error {
  const error = response.error;
  const message = error?.message ? ` message=${error.message}` : '';
  const code = error?.code ? ` code=${error.code}` : '';
  return new Error(`Unable to upsert profile: userId=${userId} slug=${slug}${code}${message}`);
}
