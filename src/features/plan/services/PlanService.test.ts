import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Viewer } from "@/features/auth/lib/session";
import type { BudgetRepository } from "@/features/budget/repositories/BudgetRepository";
import type { ProfileRepository } from "@/features/profile/repositories/ProfileRepository";
import { fetchGeoapifyPlaceDetails } from "@/features/search/services/GeoapifyService";
import { fetchWikidataImage } from "@/features/search/services/WikidataService";
import type { SnapshotsService } from "@/features/snapshots/services/SnapshotsService";
import type { PlanRepository } from "../repositories/PlanRepository";
import { PlanService } from "./PlanService";

const { fetchProfileSlugByUserId } = vi.hoisted(() => ({ fetchProfileSlugByUserId: vi.fn() }));
vi.mock("@/features/search/services/GeoapifyService", () => ({
  fetchGeoapifyPlaceDetails: vi.fn(),
}));
vi.mock("@/features/search/services/WikidataService", () => ({
  fetchWikidataImage: vi.fn(),
}));

const SLUG = "abc123slug";

// Private plan where the only member is the owner.
const OWNED_PLAN = {
  id: "plan-1",
  ownerId: "owner-1",
  members: [{ userId: "owner-1", tier: "admin" }],
  destinationName: "Rome",
  title: "Trip",
  budget: null,
  startDate: null,
  endDate: null,
};

function makeService(repo: Partial<PlanRepository>, viewer: Viewer | null = { id: "owner-1" }) {
  const budgetRepo = {
    fetchPlanBudgetEntries: vi.fn().mockResolvedValue([]),
  } as unknown as BudgetRepository;
  const profileRepo = { fetchProfileSlugByUserId } as unknown as ProfileRepository;
  const snapshots = {
    fetchSnapshot: vi.fn().mockResolvedValue({ version: 0, days: [], updatedAt: new Date(0).toISOString() }),
  } as unknown as SnapshotsService;
  return new PlanService(repo as PlanRepository, budgetRepo, profileRepo, snapshots, viewer);
}

describe("PlanService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchProfileSlugByUserId).mockResolvedValue(null);
  });

  describe("getPlannerExperience — membership-only access", () => {
    it("throws NOT_FOUND when the plan does not exist", async () => {
      const service = makeService({
        fetchPlanBySlug: vi.fn().mockResolvedValue(null),
      });

      await expect(service.getPlannerExperience({ identifier: SLUG })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("throws FORBIDDEN for a non-member", async () => {
      const service = makeService(
        { fetchPlanBySlug: vi.fn().mockResolvedValue({ ...OWNED_PLAN, members: [] }) },
        { id: "stranger" }
      );

      await expect(service.getPlannerExperience({ identifier: SLUG })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  describe("deletePlan", () => {
    it("throws BAD_REQUEST for an empty id", async () => {
      const service = makeService({}, null);
      await expect(service.deletePlan("   ")).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("throws NOT_FOUND when the plan does not exist", async () => {
      const service = makeService({
        fetchPlanByIdWithMembers: vi.fn().mockResolvedValue(null),
      });

      await expect(service.deletePlan("plan-1")).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("throws FORBIDDEN for a non-owner", async () => {
      const service = makeService(
        { fetchPlanByIdWithMembers: vi.fn().mockResolvedValue(OWNED_PLAN) },
        { id: "other" }
      );

      await expect(service.deletePlan("plan-1")).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("deletes the plan and resolves a redirect to the user's public page", async () => {
      vi.mocked(fetchProfileSlugByUserId).mockResolvedValue("owner-slug");
      const deleteFn = vi.fn().mockResolvedValue(undefined);
      const service = makeService({
        fetchPlanByIdWithMembers: vi.fn().mockResolvedValue(OWNED_PLAN),
        delete: deleteFn,
      });

      await expect(service.deletePlan("plan-1")).resolves.toBe("/u/owner-slug");

      expect(deleteFn).toHaveBeenCalledWith("plan-1");
    });
  });

  describe("member mutations", () => {
    it.each([
      ["updatePlanTitle", (s: PlanService) => s.updatePlanTitle("plan-1", "New")],
      [
        "updatePlanDates",
        (s: PlanService) => s.updatePlanDates("plan-1", new Date("2024-01-10"), new Date("2024-01-15")),
      ],
    ])("throws UNAUTHORIZED for an anonymous %s caller without hitting the repo", async (_name, call) => {
      const service = makeService({}, null);
      await expect(call(service)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    });
  });

  describe("createUserPlan", () => {
    it("requires a user and delegates to the repo, returning formatted output", async () => {
      const service = makeService({
        createPlan: vi.fn().mockResolvedValue({ id: "plan-123" }),
        updatePlanCoverImage: vi.fn().mockResolvedValue(undefined),
      });

      const result = await service.createUserPlan({
        title: "Paris trip",
        destination: { name: "Paris", country: "FR" },
        startDate: "2024-01-10T00:00:00Z",
        endDate: "2024-01-15T00:00:00Z",
      });

      expect(result).toEqual({ planId: "plan-123" });
    });

    it("updates cover image in the background when placeId is provided", async () => {
      vi.mocked(fetchGeoapifyPlaceDetails).mockResolvedValue({
        placeId: "place-123",
        name: "Paris",
        formatted: "Paris, France",
        latitude: 48.85,
        longitude: 2.35,
        wikidataId: "Q90",
        categories: [],
      });
      vi.mocked(fetchWikidataImage).mockResolvedValue("https://wikimedia.org/image.jpg");
      const updateCover = vi.fn().mockResolvedValue(undefined);

      const service = makeService({
        createPlan: vi.fn().mockResolvedValue({ id: "plan-123" }),
        updatePlanCoverImage: updateCover,
      });

      await service.createUserPlan({
        title: "Paris trip",
        destination: { name: "Paris", placeId: "place-123" },
        startDate: "2024-01-10T00:00:00Z",
        endDate: "2024-01-15T00:00:00Z",
      });

      await vi.waitFor(
        () => {
          expect(updateCover).toHaveBeenCalledWith("plan-123", "https://wikimedia.org/image.jpg");
        },
        { timeout: 1000 }
      );
    });
  });
});

describe("dashboard projection", () => {
  const summary = {
    id: "plan-1",
    title: "Trip",
    destination_name: " Lisbon ",
    start_date: null,
    end_date: null,
    updated_at: null,
    cover_image: null,
    destination_country: "PT",
    latitude: null,
    longitude: null,
    activity_count: 2,
  };

  it("limits cards to 50 without truncating the map, preserving query order", async () => {
    const rows = Array.from({ length: 55 }, (_, i) => ({ ...summary, id: `plan-${i}` }));
    const fetchUserPlanSummaries = vi.fn().mockResolvedValue(rows);
    const result = await makeService({ fetchUserPlanSummaries }).getUserDashboard();
    expect(result.plans.map((p) => p.id)).toEqual(rows.slice(0, 50).map((p) => p.id));
    expect(result.plans[0]).toEqual({
      id: "plan-0",
      title: "Trip",
      destination: " Lisbon ",
      startDate: null,
      endDate: null,
      updatedAt: null,
      coverImage: null,
    });
    expect(result.destinations).toHaveLength(55);
    expect(result.destinations.at(-1)).toEqual({
      planId: "plan-54",
      planTitle: "Trip",
      startDate: null,
      endDate: null,
      name: "Lisbon",
      country: "PT",
      lat: null,
      lng: null,
      activityCount: 2,
    });
    expect(fetchUserPlanSummaries).toHaveBeenCalledOnce();
  });

  it("keeps destination-less cards but excludes them from the map", async () => {
    const fetchUserPlanSummaries = vi.fn().mockResolvedValue([
      { ...summary, destination_name: null },
      { ...summary, id: "blank", destination_name: "  " },
    ]);
    const result = await makeService({ fetchUserPlanSummaries }).getUserDashboard();
    expect(result.plans).toHaveLength(2);
    expect(result.destinations).toEqual([]);
  });

  it("returns an empty dashboard when the user has no plans", async () => {
    const fetchUserPlanSummaries = vi.fn().mockResolvedValue([]);
    expect(await makeService({ fetchUserPlanSummaries }).getUserDashboard()).toEqual({
      plans: [],
      destinations: [],
    });
  });

  it.each([
    [null, "Lisbon", "Lisbon", "Untitled trip"],
    [null, null, "Untitled plan", undefined],
    ["  ", "Lisbon", "  ", "Untitled trip"],
    [" Trip ", "Lisbon", " Trip ", "Trip"],
  ])(
    "uses the expected titles for %j and destination %j",
    async (title, destination, cardTitle, mapTitle) => {
      const fetchUserPlanSummaries = vi
        .fn()
        .mockResolvedValue([{ ...summary, title, destination_name: destination }]);
      const result = await makeService({ fetchUserPlanSummaries }).getUserDashboard();
      expect(result.plans[0].title).toBe(cardTitle);
      expect(result.destinations[0]?.planTitle).toBe(mapTitle);
    }
  );

  it("preserves dates, coordinates, cover and zero activity counts", async () => {
    const fetchUserPlanSummaries = vi.fn().mockResolvedValue([
      {
        ...summary,
        start_date: "2026-09-01",
        end_date: "2026-09-03",
        updated_at: "2026-09-01T12:00:00Z",
        cover_image: "https://example.com/cover.jpg",
        latitude: 0,
        longitude: 0,
        activity_count: 0,
      },
    ]);
    const result = await makeService({ fetchUserPlanSummaries }).getUserDashboard();
    expect(result.plans[0]).toMatchObject({
      startDate: "2026-09-01",
      endDate: "2026-09-03",
      updatedAt: "2026-09-01T12:00:00Z",
      coverImage: "https://example.com/cover.jpg",
    });
    expect(result.destinations[0]).toMatchObject({
      startDate: "2026-09-01",
      endDate: "2026-09-03",
      lat: 0,
      lng: 0,
      activityCount: 0,
    });
  });

  it("propagates read failures instead of returning an empty dashboard", async () => {
    const error = new Error("Dashboard unavailable");
    const fetchUserPlanSummaries = vi.fn().mockRejectedValue(error);
    await expect(makeService({ fetchUserPlanSummaries }).getUserDashboard()).rejects.toBe(error);
  });

  it("requires authentication before querying", async () => {
    const fetchUserPlanSummaries = vi.fn();
    await expect(makeService({ fetchUserPlanSummaries }, null).getUserDashboard()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(fetchUserPlanSummaries).not.toHaveBeenCalled();
  });
});
