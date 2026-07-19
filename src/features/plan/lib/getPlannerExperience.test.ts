import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireUser, UnauthorizedError } from "@/shared/lib/auth/session";

import { fetchPlanByIdWithMembers, fetchPlanBySlug } from "../repositories/PlanRepository";
import { getPlannerExperience } from "./getPlannerExperience";

vi.mock("@/shared/lib/auth/session", async () => {
  const actual =
    await vi.importActual<typeof import("@/shared/lib/auth/session")>("@/shared/lib/auth/session");
  return { ...actual, requireUser: vi.fn() };
});
vi.mock("../repositories/PlanRepository", () => ({
  fetchPlanByIdWithMembers: vi.fn(),
  fetchPlanBySlug: vi.fn(),
  fetchLatestSnapshot: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/features/budget/repositories/BudgetRepository", () => ({
  fetchPlanBudgetEntries: vi.fn().mockResolvedValue([]),
}));

// notFound/redirect throw so control flow stops, like Next at runtime.
const NEXT_NOT_FOUND = new Error("NEXT_NOT_FOUND");
const NEXT_REDIRECT = new Error("NEXT_REDIRECT");
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw NEXT_NOT_FOUND;
  },
  redirect: (url: string) => {
    throw Object.assign(NEXT_REDIRECT, { url });
  },
}));

const SLUG = "abc123slug";
const UUID = "11111111-2222-4333-8444-555555555555";
const PLAN = {
  id: "plan-1",
  ownerId: "owner-1",
  members: [{ userId: "owner-1", tier: "admin" }],
  destinations: [{ name: "Rome" }],
  title: "Trip",
  budget: null,
  startDate: null,
  endDate: null,
} as unknown as Awaited<ReturnType<typeof fetchPlanBySlug>>;

describe("getPlannerExperience — authenticated-only access", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects anonymous visitors on a slug to /login", async () => {
    vi.mocked(requireUser).mockRejectedValueOnce(new UnauthorizedError());

    await expect(getPlannerExperience({ identifier: SLUG })).rejects.toMatchObject({
      url: "/login",
    });
    expect(fetchPlanBySlug).not.toHaveBeenCalled();
  });

  it("returns notFound for a logged-in non-member on a slug plan", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({ id: "stranger" });
    vi.mocked(fetchPlanBySlug).mockResolvedValueOnce(PLAN);

    await expect(getPlannerExperience({ identifier: SLUG })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("grants a member access via slug", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({ id: "owner-1" });
    vi.mocked(fetchPlanBySlug).mockResolvedValueOnce(PLAN);

    const result = await getPlannerExperience({ identifier: SLUG });

    expect(result).toMatchObject({ planId: "plan-1", slug: SLUG, isOwner: true, canEdit: true });
    expect(fetchPlanByIdWithMembers).not.toHaveBeenCalled();
  });

  it("grants a member access via UUID id", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({ id: "owner-1" });
    vi.mocked(fetchPlanByIdWithMembers).mockResolvedValueOnce(PLAN);

    const result = await getPlannerExperience({ identifier: UUID });

    expect(result).toMatchObject({ planId: "plan-1", slug: undefined, isOwner: true });
    expect(fetchPlanBySlug).not.toHaveBeenCalled();
  });

  it("returns notFound for a logged-in non-member on a UUID plan", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({ id: "stranger" });
    vi.mocked(fetchPlanByIdWithMembers).mockResolvedValueOnce(PLAN);

    await expect(getPlannerExperience({ identifier: UUID })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("falls back to undefined days when the plan date range is reversed", async () => {
    vi.mocked(requireUser).mockResolvedValueOnce({ id: "owner-1" });
    vi.mocked(fetchPlanBySlug).mockResolvedValueOnce({
      ...(PLAN as object),
      startDate: "2026-07-20",
      endDate: "2026-07-10",
    } as typeof PLAN);

    const result = await getPlannerExperience({ identifier: SLUG });

    expect(result.initialDays).toBeUndefined();
  });
});
