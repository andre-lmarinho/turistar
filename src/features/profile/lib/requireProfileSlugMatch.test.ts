import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireUser, UnauthorizedError } from "@/shared/lib/auth/session";

import { getProfileBySlug } from "../lib/getProfileBySlug";
import { requireProfileSlugMatch } from "./requireProfileSlugMatch";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/features/profile/lib/getProfileBySlug", () => ({
  getProfileBySlug: vi.fn(),
}));

vi.mock("@/shared/lib/auth/session", () => {
  class UnauthorizedError extends Error {
    constructor(message = "Authentication required.") {
      super(message);
      this.name = "UnauthorizedError";
    }
  }

  return {
    requireUser: vi.fn(),
    UnauthorizedError,
  };
});

describe("requireProfileSlugMatch", () => {
  const redirectError = Object.assign(new Error("NEXT_REDIRECT"), {
    digest: "NEXT_REDIRECT",
  });

  beforeEach(() => {
    vi.mocked(redirect).mockReset();
    vi.mocked(redirect).mockImplementation(() => {
      throw redirectError;
    });
    vi.mocked(requireUser).mockReset();
    vi.mocked(getProfileBySlug).mockReset();
  });

  it("redirects when slug is empty", async () => {
    await expect(requireProfileSlugMatch("   ")).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenCalledWith("/login");
    expect(requireUser).not.toHaveBeenCalled();
    expect(getProfileBySlug).not.toHaveBeenCalled();
  });

  it("redirects when the user is unauthorized", async () => {
    vi.mocked(requireUser).mockRejectedValue(new UnauthorizedError());

    await expect(requireProfileSlugMatch("alice")).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects when profile is missing", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1" });
    vi.mocked(getProfileBySlug).mockResolvedValue(null);

    await expect(requireProfileSlugMatch("alice")).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenCalledWith("/login");
    expect(getProfileBySlug).toHaveBeenCalledWith("alice");
  });

  it("redirects when profile does not match the user", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1" });
    vi.mocked(getProfileBySlug).mockResolvedValue({
      userId: "user-2",
      slug: "alice",
      displayName: "Alice",
      avatarUrl: null,
    });

    await expect(requireProfileSlugMatch("alice")).rejects.toBe(redirectError);
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("returns user and profile when slug matches", async () => {
    const user = { id: "user-1", email: "alice@example.com" };
    const profile = {
      userId: "user-1",
      slug: "alice",
      displayName: "Alice",
      avatarUrl: null,
    };
    vi.mocked(requireUser).mockResolvedValue(user);
    vi.mocked(getProfileBySlug).mockResolvedValue(profile);

    await expect(requireProfileSlugMatch(" alice ")).resolves.toEqual({ user, profile });
    expect(getProfileBySlug).toHaveBeenCalledWith("alice");
  });

  it("wraps unexpected errors with context", async () => {
    const failure = new Error("Supabase failed");
    vi.mocked(requireUser).mockResolvedValue({ id: "user-1" });
    vi.mocked(getProfileBySlug).mockRejectedValue(failure);

    const error = await requireProfileSlugMatch("alice").catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("Unable to validate profile slug match: slug=alice");
    expect((error as Error).cause).toBe(failure);
  });
});
