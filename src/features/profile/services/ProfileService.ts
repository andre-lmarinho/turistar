import "server-only";
import { normalizeUsername, validUsername } from "@/features/profile/utils/validUsername";
import { ApplicationError } from "@/lib/errors/ApplicationError";
import { isRecord, readString } from "@/lib/typeGuards";

import type { ProfileRepository } from "../repositories/ProfileRepository";
import type { ProfileSummary } from "../types";

export class ProfileService {
  constructor(private readonly repo: ProfileRepository) {}

  async getViewerProfile(userId: string): Promise<ProfileSummary> {
    const profile = await this.repo.fetchProfileByUserId(userId);

    if (!profile) {
      throw new ApplicationError("NOT_FOUND", "Profile not found.");
    }

    return profile;
  }

  async updateViewerProfile(
    userId: string,
    input: { slug: string; displayName: string }
  ): Promise<ProfileSummary> {
    const slug = normalizeUsername(input.slug);
    const displayName = input.displayName.trim();

    if (!validUsername(slug)) {
      throw new ApplicationError("BAD_REQUEST", "Username must use lowercase letters, numbers, or hyphens.");
    }
    if (!displayName) {
      throw new ApplicationError("BAD_REQUEST", "Display name is required.");
    }

    try {
      return await this.repo.updateProfile({ userId, slug, displayName });
    } catch (error) {
      if (extractSupabaseErrorCode(error) === "23505") {
        throw new ApplicationError("CONFLICT", "Username is already in use.");
      }
      throw error;
    }
  }

  async ensureProfile(viewer: { id: string }): Promise<string> {
    const profile = await this.getViewerProfile(viewer.id);
    if (!profile.slug) {
      throw new ApplicationError("NOT_FOUND", `ensureProfile: missing slug for userId=${viewer.id}`);
    }
    return profile.slug;
  }
}

function extractSupabaseErrorCode(error: unknown): string | null {
  const direct = isRecord(error) ? error : null;
  const cause =
    error instanceof Error && "cause" in error ? (error as Error & { cause?: unknown }).cause : null;
  const causeRecord = isRecord(cause) ? cause : null;
  return readString(causeRecord?.code) ?? readString(direct?.code);
}
