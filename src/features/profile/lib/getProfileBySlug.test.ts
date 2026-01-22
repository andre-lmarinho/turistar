import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchProfileBySlug } from "../repositories/ProfileRepository";
import type { ProfileRecord } from "../types";
import { getProfileBySlug } from "./getProfileBySlug";

vi.mock("@/features/profile/repositories/ProfileRepository", () => ({
  fetchProfileBySlug: vi.fn(),
}));

describe("getProfileBySlug", () => {
  beforeEach(() => {
    vi.mocked(fetchProfileBySlug).mockReset();
  });

  it("returns null when slug is empty or whitespace", async () => {
    const result = await getProfileBySlug("   ");

    expect(result).toBeNull();
    expect(fetchProfileBySlug).not.toHaveBeenCalled();
  });

  it("returns null when repository has no profile", async () => {
    vi.mocked(fetchProfileBySlug).mockResolvedValue(null);

    const profile = await getProfileBySlug("alice");

    expect(profile).toBeNull();
    expect(fetchProfileBySlug).toHaveBeenCalledWith("alice");
  });

  it("propagates repository errors", async () => {
    const failure = new Error("fail");
    vi.mocked(fetchProfileBySlug).mockRejectedValue(failure);

    await expect(getProfileBySlug("alice")).rejects.toBe(failure);
  });

  it("returns a ProfileRecord from the repository", async () => {
    const profile: ProfileRecord = {
      userId: "user-1",
      slug: "alice",
      displayName: "Alice",
      avatarUrl: "https://avatar.png",
    };
    vi.mocked(fetchProfileBySlug).mockResolvedValue(profile);

    const result = await getProfileBySlug(" alice ");

    expect(result).toEqual(profile);
    expect(fetchProfileBySlug).toHaveBeenCalledWith("alice");
  });
});
