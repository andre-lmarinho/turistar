import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPlan } from "@/features/userPlanners/lib/createPlan";
import { requireUser } from "@/shared/lib/auth/session";

import { createUserPlan } from "./createUserPlan";

vi.mock("@/shared/lib/auth/session", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/features/userPlanners/lib/createPlan", () => ({
  createPlan: vi.fn(),
}));

describe("createUserPlan", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockReset();
    vi.mocked(createPlan).mockReset();
  });

  it("requires a user, forwards params to createPlan, and returns formatted output", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "user-123" });
    vi.mocked(createPlan).mockResolvedValue({
      id: "plan-123",
      publicSlug: "slug-123",
      editToken: "token-123",
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
      "user-123"
    );
    expect(result).toEqual({
      planId: "plan-123",
      publicSlug: "slug-123",
      editToken: "token-123",
    });
  });
});
