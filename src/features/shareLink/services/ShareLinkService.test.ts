import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ShareLink } from "../types";
import { acceptShareLink, createShareLink, getShareLink, revokeShareLink } from "./ShareLinkService";

const { mockCreateSupabaseServerClient, mockEnsureProfile } = vi.hoisted(() => ({
  mockCreateSupabaseServerClient: vi.fn(),
  mockEnsureProfile: vi.fn(),
}));

const planRepositoryMocks = vi.hoisted(() => ({
  resolvePlanIdentity: vi.fn(),
}));

const shareLinkRepositoryMocks = vi.hoisted(() => ({
  fetchShareLink: vi.fn(),
  createShareLink: vi.fn(),
  revokeShareLink: vi.fn(),
  acceptShareLink: vi.fn(),
}));

vi.mock("@/shared/lib/supabaseServer", () => ({
  createSupabaseServerClient: () => mockCreateSupabaseServerClient(),
}));

vi.mock("@/features/auth/lib/ensureProfile", () => ({
  ensureProfile: (...args: unknown[]) => mockEnsureProfile(...args),
}));

vi.mock("@/features/plan/repositories/PlanRepository", () => ({
  __esModule: true,
  resolvePlanIdentity: (...args: unknown[]) => planRepositoryMocks.resolvePlanIdentity(...args),
}));

vi.mock("../repositories/ShareLinkRepository", () => ({
  __esModule: true,
  fetchShareLink: shareLinkRepositoryMocks.fetchShareLink,
  createShareLink: shareLinkRepositoryMocks.createShareLink,
  revokeShareLink: shareLinkRepositoryMocks.revokeShareLink,
  acceptShareLink: shareLinkRepositoryMocks.acceptShareLink,
}));

describe("ShareLinkService", () => {
  const client = { id: "client-1" };

  beforeEach(() => {
    mockCreateSupabaseServerClient.mockReset();
    mockEnsureProfile.mockReset();
    planRepositoryMocks.resolvePlanIdentity.mockReset();
    shareLinkRepositoryMocks.fetchShareLink.mockReset();
    shareLinkRepositoryMocks.createShareLink.mockReset();
    shareLinkRepositoryMocks.revokeShareLink.mockReset();
    shareLinkRepositoryMocks.acceptShareLink.mockReset();
    mockCreateSupabaseServerClient.mockReturnValue(client);
  });

  it("returns null for empty plan id or slug when fetching share links", async () => {
    const result = await getShareLink("   ");

    expect(result).toBeNull();
    expect(mockCreateSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns null when the plan does not exist for share links", async () => {
    planRepositoryMocks.resolvePlanIdentity.mockResolvedValue(null);

    const result = await getShareLink("plan-1");

    expect(result).toBeNull();
    expect(shareLinkRepositoryMocks.fetchShareLink).not.toHaveBeenCalled();
  });

  it("returns null when the share link is revoked", async () => {
    planRepositoryMocks.resolvePlanIdentity.mockResolvedValue({ id: "plan-1", ownerId: "owner-1" });
    shareLinkRepositoryMocks.fetchShareLink.mockResolvedValue({
      token: "token-1",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "user-1",
      revokedAt: "2024-01-02T00:00:00.000Z",
    });

    const result = await getShareLink("plan-1");

    expect(result).toBeNull();
  });

  it("returns the active share link", async () => {
    const link: ShareLink = {
      token: "token-1",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "user-1",
      revokedAt: null,
    };
    planRepositoryMocks.resolvePlanIdentity.mockResolvedValue({ id: "plan-1", ownerId: "owner-1" });
    shareLinkRepositoryMocks.fetchShareLink.mockResolvedValue(link);

    const result = await getShareLink("plan-1");

    expect(result).toEqual(link);
  });

  it("creates share links with a resolved plan id", async () => {
    planRepositoryMocks.resolvePlanIdentity.mockResolvedValue({ id: "plan-1", ownerId: "owner-1" });
    shareLinkRepositoryMocks.createShareLink.mockResolvedValue("token-1");

    const result = await createShareLink("plan-1");

    expect(result).toBe("token-1");
    expect(shareLinkRepositoryMocks.createShareLink).toHaveBeenCalledWith("plan-1", { client });
  });

  it.each([
    ["createShareLink", () => createShareLink("plan-1"), "createShareLink: plan not found"],
    ["revokeShareLink", () => revokeShareLink("plan-1"), "revokeShareLink: plan not found"],
  ])("throws when %s cannot resolve the plan", async (_label: string, call: () => Promise<unknown>, message: string) => {
    planRepositoryMocks.resolvePlanIdentity.mockResolvedValue(null);

    await expect(call()).rejects.toThrow(message);
  });

  it("accepts share links when authenticated", async () => {
    shareLinkRepositoryMocks.acceptShareLink.mockResolvedValue("plan-1");

    const result = await acceptShareLink("token-1");

    expect(result).toEqual({ success: true, planId: "plan-1" });
    expect(mockEnsureProfile).toHaveBeenCalledWith({ client });
  });

  it("returns an error when the token is empty", async () => {
    const result = await acceptShareLink(" ");

    expect(result).toEqual({ success: false, error: "Invalid token." });
  });

  it("maps invalid share link errors", async () => {
    shareLinkRepositoryMocks.acceptShareLink.mockRejectedValue(new Error("Invalid or expired link"));

    const result = await acceptShareLink("token-1");

    expect(result).toEqual({ success: false, error: "This share link is invalid or has expired." });
  });

  it("maps unauthenticated errors for share links", async () => {
    shareLinkRepositoryMocks.acceptShareLink.mockRejectedValue(new Error("Not authenticated"));

    const result = await acceptShareLink("token-1");

    expect(result).toEqual({ success: false, error: "Please sign in to join this planner." });
  });

  it("falls back to a generic error for share link failures", async () => {
    shareLinkRepositoryMocks.acceptShareLink.mockRejectedValue(new Error("Unexpected"));

    const result = await acceptShareLink("token-1");

    expect(result).toEqual({ success: false, error: "We could not accept this invite right now." });
  });
});
