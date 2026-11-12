import { vi } from "vitest";

import { ApplicationError } from "@/lib/errors";
import PlannerPlanPage from "./page";

const { mockGetPlannerExperience, mockGetViewer, mockNotFound, mockRedirect } = vi.hoisted(() => ({
  mockGetPlannerExperience: vi.fn(),
  mockGetViewer: vi.fn(),
  mockNotFound: vi.fn(),
  mockRedirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
  redirect: mockRedirect,
}));
vi.mock("@/features/auth/lib/session", () => ({ getViewer: mockGetViewer }));
vi.mock("@/features/plan/services/createPlanService", () => ({
  createPlanService: () => ({ getPlannerExperience: mockGetPlannerExperience }),
}));
vi.mock("@/modules/planner/planid-view", () => ({ PlanIdView: () => null }));

const props = {
  params: Promise.resolve({ planId: "plan-1" }),
  searchParams: Promise.resolve({}),
};

describe("PlannerPlanPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation(() => {
      throw new Error("redirect");
    });
    mockNotFound.mockImplementation(() => {
      throw new Error("not found");
    });
  });

  it("redirects unauthenticated viewers back to the requested plan", async () => {
    mockGetPlannerExperience.mockRejectedValue(new ApplicationError("UNAUTHORIZED", "Sign in"));

    await expect(PlannerPlanPage(props)).rejects.toThrow("redirect");

    expect(mockRedirect).toHaveBeenCalledWith("/login?next=%2Fp%2Fplan-1");
  });

  it.each(["NOT_FOUND", "FORBIDDEN"] as const)("conceals %s plan errors as not found", async (code) => {
    mockGetPlannerExperience.mockRejectedValue(new ApplicationError(code, "Unavailable"));

    await expect(PlannerPlanPage(props)).rejects.toThrow("not found");

    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("rethrows unexpected application errors", async () => {
    const error = new ApplicationError("INTERNAL_SERVER_ERROR", "Loading failed");
    mockGetPlannerExperience.mockRejectedValue(error);

    await expect(PlannerPlanPage(props)).rejects.toBe(error);

    expect(mockNotFound).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
