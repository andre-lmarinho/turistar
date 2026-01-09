import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UserProfileRecord } from "@/features/user/repositories/ProfileRepository";
import { fetchProfileBySlug } from "@/features/user/repositories/ProfileRepository";

import { getUserProfileBySlug } from "./getUserProfileBySlug";

vi.mock("@/features/user/repositories/ProfileRepository", () => ({
  fetchProfileBySlug: vi.fn(),
}));

describe("getUserProfileBySlug", () => {
  beforeEach(() => {
    vi.mocked(fetchProfileBySlug).mockReset();
  });

  it("returns null when slug is empty or whitespace", async () => {
    const result = await getUserProfileBySlug("   ");

    expect(result).toBeNull();
    expect(fetchProfileBySlug).not.toHaveBeenCalled();
  });

  it("returns null when repository has no profile", async () => {
    vi.mocked(fetchProfileBySlug).mockResolvedValue(null);

    const profile = await getUserProfileBySlug("alice");

    expect(profile).toBeNull();
    expect(fetchProfileBySlug).toHaveBeenCalledWith("alice");
  });

  it("propagates repository errors", async () => {
    const failure = new Error("fail");
    vi.mocked(fetchProfileBySlug).mockRejectedValue(failure);

    await expect(getUserProfileBySlug("alice")).rejects.toBe(failure);
  });

  it("returns a UserProfileRecord from the repository", async () => {
    const profile: UserProfileRecord = {
      userId: "user-1",
      slug: "alice",
      displayName: "Alice",
      avatarUrl: "https://avatar.png",
    };
    vi.mocked(fetchProfileBySlug).mockResolvedValue(profile);

    const result = await getUserProfileBySlug(" alice ");

    expect(result).toEqual(profile);
    expect(fetchProfileBySlug).toHaveBeenCalledWith("alice");
  });
});
