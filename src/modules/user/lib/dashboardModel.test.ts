import { describe, expect, it } from "vitest";

import type { UserDestination } from "@/features/plan/repositories/PlanRepository";

import { buildCountrySummaries } from "./dashboardModel";

function destination(overrides: Partial<UserDestination> = {}): UserDestination {
  return {
    planId: "plan-1",
    planTitle: "Brazil",
    startDate: null,
    endDate: null,
    name: "Rio de Janeiro",
    country: "BR",
    lat: null,
    lng: null,
    activityCount: 2,
    ...overrides,
  };
}

describe("buildCountrySummaries", () => {
  it("groups destinations by normalized country and counts each trip once", () => {
    expect(
      buildCountrySummaries([
        destination({ name: "Rio", country: " BR " }),
        destination({ name: "São Paulo", country: "br", activityCount: 3 }),
        destination({ planId: "plan-2", planTitle: "Portugal", country: "PT", activityCount: 1 }),
      ])
    ).toEqual([
      {
        code: "br",
        tripCount: 1,
        locationCount: 5,
        trips: [{ id: "plan-1", title: "Brazil" }],
      },
      {
        code: "pt",
        tripCount: 1,
        locationCount: 1,
        trips: [{ id: "plan-2", title: "Portugal" }],
      },
    ]);
  });

  it("ignores destinations without a country code", () => {
    expect(buildCountrySummaries([destination({ country: null }), destination({ country: "  " })])).toEqual(
      []
    );
  });
});
