import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";

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

export type ProfileUpsertResult = {
  slug: string;
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
type ProfileSlugRow = {
  slug: string;
};

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function fetchProfileBySlug(
  slug: string,
  { client }: ProfileRepositoryOptions = {}
): Promise<UserProfileRecord | null> {
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

  return { slug: data.slug };
}
