import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchGeoapifyPlaceDetails } from "@/features/search/services/GeoapifyService";
import { fetchWikidataImage } from "@/features/search/services/WikidataService";
import { requireUser } from "@/shared/lib/auth/session";

import { createPlan } from "./createPlan";
import { createUserPlan } from "./createUserPlan";
import { setPlanVisibility } from "./setPlanVisibility";
import { updatePlanCoverImage } from "./updatePlanCoverImage";

vi.mock("@/shared/lib/auth/session", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/features/plan/lib/createPlan", () => ({
  createPlan: vi.fn(),
}));

vi.mock("@/features/plan/lib/updatePlanCoverImage", () => ({
  updatePlanCoverImage: vi.fn(),
}));

vi.mock("@/features/plan/lib/setPlanVisibility", () => ({
  setPlanVisibility: vi.fn(),
}));

vi.mock("@/features/search/services/GeoapifyService", () => ({
  fetchGeoapifyPlaceDetails: vi.fn(),
}));

vi.mock("@/features/search/services/WikidataService", () => ({
  fetchWikidataImage: vi.fn(),
}));

describe("createUserPlan", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockReset();
    vi.mocked(createPlan).mockReset();
    vi.mocked(updatePlanCoverImage).mockReset();
    vi.mocked(fetchGeoapifyPlaceDetails).mockReset();
    vi.mocked(fetchWikidataImage).mockReset();
    vi.mocked(setPlanVisibility).mockReset();
  });

  it("requires a user, forwards params to createPlan, and returns formatted output", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({
      id: "plan-123",
      publicSlug: "slug-123",
    });

    const result = await createUserPlan({
      title: "Paris trip",
      destination: {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "FR",
      },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
    });

    expect(requireUser).toHaveBeenCalledTimes(1);
    expect(createPlan).toHaveBeenCalledWith(
      "Paris trip",
      {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "FR",
      },
      "2024-01-10T00:00:00Z",
      "2024-01-15T00:00:00Z",
      { userId: "user-123" }
    );
    expect(result).toEqual({
      planId: "plan-123",
      publicSlug: "slug-123",
    });
  });

  it("fetches and updates cover image when placeId is provided", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({
      id: "plan-123",
      publicSlug: "slug-123",
    });
    vi.mocked(fetchGeoapifyPlaceDetails).mockResolvedValue({
      placeId: "place-123",
      name: "Paris",
      formatted: "Paris, France",
      latitude: 48.8566,
      longitude: 2.3522,
      wikidataId: "Q90",
      categories: [],
    });
    vi.mocked(fetchWikidataImage).mockResolvedValue("https://wikimedia.org/image.jpg");
    vi.mocked(updatePlanCoverImage).mockResolvedValue();

    const result = await createUserPlan({
      title: "Paris trip",
      destination: {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "FR",
        placeId: "place-123",
      },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
    });

    expect(result).toEqual({
      planId: "plan-123",
      publicSlug: "slug-123",
    });

    // Wait for the background promise chain to complete
    await vi.waitFor(
      () => {
        expect(updatePlanCoverImage).toHaveBeenCalledWith("plan-123", "https://wikimedia.org/image.jpg");
      },
      { timeout: 1000 }
    );

    expect(fetchGeoapifyPlaceDetails).toHaveBeenCalledWith("place-123");
    expect(fetchWikidataImage).toHaveBeenCalledWith("Q90");
  });

  it("does not fetch cover image when placeId is not provided", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({
      id: "plan-123",
      publicSlug: "slug-123",
    });

    await createUserPlan({
      title: "Paris trip",
      destination: {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "FR",
      },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
    });

    // Wait to ensure background promises don't execute
    await vi.waitFor(
      () => {
        expect(fetchGeoapifyPlaceDetails).not.toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    expect(fetchWikidataImage).not.toHaveBeenCalled();
    expect(updatePlanCoverImage).not.toHaveBeenCalled();
  });

  it("does not update cover image when wikidataId is not available", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({
      id: "plan-123",
      publicSlug: "slug-123",
    });
    vi.mocked(fetchGeoapifyPlaceDetails).mockResolvedValue({
      placeId: "place-123",
      name: "Paris",
      formatted: "Paris, France",
      latitude: 48.8566,
      longitude: 2.3522,
      wikidataId: undefined,
      categories: [],
    });

    await createUserPlan({
      title: "Paris trip",
      destination: {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "FR",
        placeId: "place-123",
      },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchGeoapifyPlaceDetails).toHaveBeenCalledWith("place-123");
    expect(fetchWikidataImage).not.toHaveBeenCalled();
    expect(updatePlanCoverImage).not.toHaveBeenCalled();
  });

  it("does not update cover image when fetchWikidataImage returns undefined", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({
      id: "plan-123",
      publicSlug: "slug-123",
    });
    vi.mocked(fetchGeoapifyPlaceDetails).mockResolvedValue({
      placeId: "place-123",
      name: "Paris",
      formatted: "Paris, France",
      latitude: 48.8566,
      longitude: 2.3522,
      wikidataId: "Q90",
      categories: [],
    });
    vi.mocked(fetchWikidataImage).mockResolvedValue(undefined);

    await createUserPlan({
      title: "Paris trip",
      destination: {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "FR",
        placeId: "place-123",
      },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchGeoapifyPlaceDetails).toHaveBeenCalledWith("place-123");
    expect(fetchWikidataImage).toHaveBeenCalledWith("Q90");
    expect(updatePlanCoverImage).not.toHaveBeenCalled();
  });

  it("handles errors during cover image fetch gracefully without failing plan creation", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({
      id: "plan-123",
      publicSlug: "slug-123",
    });
    vi.mocked(fetchGeoapifyPlaceDetails).mockRejectedValue(new Error("API error"));

    const result = await createUserPlan({
      title: "Paris trip",
      destination: {
        name: "Paris",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "FR",
        placeId: "place-123",
      },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
    });

    // Plan creation should succeed despite cover image fetch failure
    expect(result).toEqual({
      planId: "plan-123",
      publicSlug: "slug-123",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch cover image metadata", {
      placeId: "place-123",
      error: expect.any(Error),
    });
    expect(updatePlanCoverImage).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("publishes the plan when isPublic is true", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({ id: "plan-123", publicSlug: "slug-123" });
    vi.mocked(setPlanVisibility).mockResolvedValue();

    const result = await createUserPlan({
      title: "Paris trip",
      destination: { name: "Paris" },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
      isPublic: true,
    });

    expect(setPlanVisibility).toHaveBeenCalledWith("plan-123", true);
    expect(result).toEqual({ planId: "plan-123", publicSlug: "slug-123" });
  });

  it("does not publish when isPublic is not set", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({ id: "plan-123", publicSlug: "slug-123" });

    await createUserPlan({
      title: "Paris trip",
      destination: { name: "Paris" },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
    });

    expect(setPlanVisibility).not.toHaveBeenCalled();
  });

  it("keeps the created plan when publishing fails (best-effort)", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({ id: "plan-123", publicSlug: "slug-123" });
    vi.mocked(setPlanVisibility).mockRejectedValue(new Error("rls denied"));

    const result = await createUserPlan({
      title: "Paris trip",
      destination: { name: "Paris" },
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-15T00:00:00Z",
      isPublic: true,
    });

    expect(result).toEqual({ planId: "plan-123", publicSlug: "slug-123" });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to publish plan on creation; left private", {
      planId: "plan-123",
      error: expect.any(Error),
    });

    consoleErrorSpy.mockRestore();
  });
});
