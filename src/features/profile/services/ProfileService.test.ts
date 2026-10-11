import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProfileRepository } from "../repositories/ProfileRepository";
import { ProfileService } from "./ProfileService";

const repositoryMocks = vi.hoisted(() => ({
  fetchProfileByUserId: vi.fn(),
  updateProfile: vi.fn(),
}));

function makeService(): ProfileService {
  return new ProfileService({
    fetchProfileByUserId: repositoryMocks.fetchProfileByUserId,
    updateProfile: repositoryMocks.updateProfile,
  } as unknown as ProfileRepository);
}

describe("ProfileService", () => {
  beforeEach(() => {
    repositoryMocks.fetchProfileByUserId.mockReset();
    repositoryMocks.updateProfile.mockReset();
  });

  it("returns the authenticated viewer profile", async () => {
    repositoryMocks.fetchProfileByUserId.mockResolvedValue({
      avatarUrl: null,
      displayName: "Ada",
      slug: "ada",
      userId: "user-1",
    });

    await expect(makeService().getViewerProfile("user-1")).resolves.toMatchObject({ slug: "ada" });
    expect(repositoryMocks.fetchProfileByUserId).toHaveBeenCalledWith("user-1");
  });

  it("updates the viewer profile with normalized values", async () => {
    repositoryMocks.updateProfile.mockResolvedValue({
      avatarUrl: null,
      displayName: "Grace Hopper",
      slug: "grace-hopper",
      userId: "user-1",
    });

    await expect(
      makeService().updateViewerProfile("user-1", { displayName: "  Grace Hopper ", slug: " Grace-Hopper " })
    ).resolves.toMatchObject({ displayName: "Grace Hopper", slug: "grace-hopper" });
    expect(repositoryMocks.updateProfile).toHaveBeenCalledWith({
      displayName: "Grace Hopper",
      slug: "grace-hopper",
      userId: "user-1",
    });
  });

  it("rejects an invalid username before writing", async () => {
    await expect(
      makeService().updateViewerProfile("user-1", { displayName: "Grace", slug: "not valid" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(repositoryMocks.updateProfile).not.toHaveBeenCalled();
  });

  it("maps a duplicate username to a conflict", async () => {
    repositoryMocks.updateProfile.mockRejectedValue(new Error("duplicate", { cause: { code: "23505" } }));

    await expect(
      makeService().updateViewerProfile("user-1", { displayName: "Grace", slug: "grace" })
    ).rejects.toMatchObject({ code: "CONFLICT", message: "Username is already in use." });
  });

  it("raises NOT_FOUND when the authenticated user has no profile", async () => {
    repositoryMocks.fetchProfileByUserId.mockResolvedValue(null);

    await expect(makeService().getViewerProfile("user-1")).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Profile not found.",
    });
  });

  it("resolves the stored slug without replacing account settings with auth metadata", async () => {
    repositoryMocks.fetchProfileByUserId.mockResolvedValue({
      userId: "user-1",
      slug: "custom-slug",
      displayName: "Custom name",
      avatarUrl: "custom-avatar",
    });
    const viewer = { id: "user-1", email: "original@example.com", user_metadata: { username: "original" } };
    await expect(makeService().ensureProfile(viewer)).resolves.toBe("custom-slug");
    expect(repositoryMocks.updateProfile).not.toHaveBeenCalled();
  });

  it("reports missing provisioning instead of creating a profile during login", async () => {
    repositoryMocks.fetchProfileByUserId.mockResolvedValue(null);
    await expect(makeService().ensureProfile({ id: "user-1" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("propagates profile read failures", async () => {
    const cause = new Error("database unavailable");
    repositoryMocks.fetchProfileByUserId.mockRejectedValue(cause);
    await expect(makeService().ensureProfile({ id: "user-1" })).rejects.toBe(cause);
  });
});
