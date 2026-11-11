import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatSupabaseError } from "@/lib/errors";
import type { Database } from "@/supabase/types";

import type { ProfileSummary } from "../types";

export type ProfileUpdatePayload = {
  userId: string;
  slug: string;
  displayName: string | null;
};

export class ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async existsBySlug(slug: string): Promise<boolean> {
    const { data, error } = await this.client.from("profiles").select("id").eq("slug", slug).maybeSingle();

    if (error) {
      throw formatSupabaseError({ operation: "existsBySlug", identifiers: { slug }, error });
    }

    return data != null;
  }

  async fetchProfileByUserId(userId: string): Promise<ProfileSummary | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id, slug, display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw formatSupabaseError({ operation: "fetchProfileByUserId", identifiers: { userId }, error });
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

  async fetchProfileSlugByUserId(userId: string): Promise<string | null> {
    const { data, error } = await this.client.from("profiles").select("slug").eq("id", userId).maybeSingle();

    if (error) {
      throw formatSupabaseError({
        operation: "fetchProfileSlugByUserId",
        identifiers: { userId },
        error,
      });
    }

    return data?.slug ?? null;
  }

  async updateProfile({ userId, slug, displayName }: ProfileUpdatePayload): Promise<ProfileSummary> {
    const { data, error } = await this.client
      .from("profiles")
      .update({ slug, display_name: displayName })
      .eq("id", userId)
      .select("id, slug, display_name, avatar_url")
      .single();

    if (error) {
      throw formatSupabaseError({ operation: "updateProfile", identifiers: { userId, slug }, error });
    }

    if (!data) {
      throw formatSupabaseError({ operation: "updateProfile:missing-row", identifiers: { userId, slug } });
    }

    return { userId: data.id, slug: data.slug, displayName: data.display_name, avatarUrl: data.avatar_url };
  }
}
