import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

import type { ProfileRecord, ProfileSummary } from "../types";

export type ProfileUpsertPayload = {
  userId: string;
  slug: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ProfileUpsertResult = {
  slug: string;
};

type ProfileRepositoryOptions = {
  client?: SupabaseClient;
};

type ProfileRow = {
  id: string;
  slug: string | null;
  display_name: string | null;
  avatar_url: string | null;
};
type ProfileSlugRow = {
  slug: string | null;
};

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function fetchProfileBySlug(
  slug: string,
  { client }: ProfileRepositoryOptions = {}
): Promise<ProfileRecord | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("profiles")
    .select("id, slug, display_name, avatar_url")
    .eq("slug", slug)
    .maybeSingle()) as unknown as { data: ProfileRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchProfileBySlug",
      identifiers: { slug },
      error,
    });
  }

  if (!data) {
    return null;
  }

  const row = data;

  if (!row.slug) {
    return null;
  }

  return {
    userId: row.id,
    slug: row.slug,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

export async function fetchProfileByUserId(
  userId: string,
  { client }: ProfileRepositoryOptions = {}
): Promise<ProfileSummary | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("profiles")
    .select("id, slug, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()) as unknown as { data: ProfileRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchProfileByUserId",
      identifiers: { userId },
      error,
    });
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

export async function fetchProfileSlugByUserId(
  userId: string,
  { client }: ProfileRepositoryOptions = {}
): Promise<string | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("profiles")
    .select("slug")
    .eq("id", userId)
    .maybeSingle()) as unknown as { data: ProfileSlugRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchProfileSlugByUserId",
      identifiers: { userId },
      error,
    });
  }

  return data?.slug ?? null;
}

export async function upsertProfile(
  { userId, slug, displayName, avatarUrl }: ProfileUpsertPayload,
  { client }: ProfileRepositoryOptions = {}
): Promise<ProfileUpsertResult> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        slug,
        display_name: displayName,
        avatar_url: avatarUrl,
      },
      { onConflict: "id" }
    )
    .select("slug")
    .single()) as unknown as { data: ProfileSlugRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "upsertProfile",
      identifiers: { userId, slug },
      error,
    });
  }

  if (!data) {
    throw formatSupabaseError({
      operation: "upsertProfile:missing-row",
      identifiers: { userId, slug },
    });
  }

  if (!data.slug) {
    throw formatSupabaseError({
      operation: "upsertProfile:missing-slug",
      identifiers: { userId, slug },
    });
  }

  return { slug: data.slug };
}
