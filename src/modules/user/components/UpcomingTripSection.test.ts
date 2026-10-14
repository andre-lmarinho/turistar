import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UserPlannerSummary } from "@/features/plan/repositories/PlanRepository";
import { getHighlightedPlan, UpcomingTripSection } from "./UpcomingTripSection";

vi.mock("next-intl/server", async () => {
  const { createTranslator, createFormatter } = await import("next-intl");
  const { default: messages } = await import("@/i18n/locales/en.json");
  return {
    getTranslations: async () => createTranslator({ locale: "en", messages }),
    getFormatter: async () => createFormatter({ locale: "en", timeZone: "UTC" }),
  };
});

const plan: UserPlannerSummary = {
  id: "plan-1",
  title: "Lisbon escape",
  destination: "Lisbon",
  startDate: "2026-09-05",
  endDate: "2026-09-09",
  updatedAt: null,
  coverImage: null,
};

describe("getHighlightedPlan", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T12:00:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the closest future plan", () => {
    const upcomingPlan = getHighlightedPlan([
      { ...plan, id: "past", startDate: "2026-08-29", endDate: "2026-08-31" },
      { ...plan, id: "later", startDate: "2026-10-01" },
      plan,
    ]);

    expect(upcomingPlan?.id).toBe(plan.id);
    expect(
      getHighlightedPlan([
        { ...plan, id: "past", startDate: "2026-08-29", endDate: "2026-08-31" },
        { ...plan, id: "undated", startDate: null },
      ])
    ).toBeNull();
  });

  it("prioritizes Rome in progress over future Boipeba without changing the input order", () => {
    const plans = [
      { ...plan, id: "boipeba", startDate: "2026-10-01", endDate: "2026-10-03" },
      { ...plan, id: "rome", startDate: "2026-08-31", endDate: "2026-09-03" },
    ];
    expect(getHighlightedPlan(plans)?.id).toBe("rome");
    expect(plans.map(({ id }) => id)).toEqual(["boipeba", "rome"]);
  });

  it.each(["2026-09-01", "2026-09-03"])("includes an ongoing trip ending on %s", (endDate) => {
    expect(getHighlightedPlan([{ ...plan, startDate: "2026-08-31", endDate }])?.id).toBe(plan.id);
  });

  it("includes a trip starting today", () => {
    expect(getHighlightedPlan([{ ...plan, id: "today", startDate: "2026-09-01" }, plan])?.id).toBe("today");
  });

  it("uses the supplied calendar day instead of the system clock", () => {
    expect(getHighlightedPlan([plan], new Date("2026-09-10T00:00:00"))).toBeNull();
  });

  it("keeps the earliest start when several trips are ongoing", () => {
    const earlier = { ...plan, id: "earlier", startDate: "2026-08-28" };
    expect(getHighlightedPlan([{ ...plan, id: "later", startDate: "2026-08-31" }, earlier])).toBe(earlier);
  });

  it("returns null for an empty list", () => {
    expect(getHighlightedPlan([])).toBeNull();
  });

  it("renders the departure countdown for an upcoming trip", async () => {
    render(await UpcomingTripSection({ plan }));
    expect(screen.getByText("Next trip")).toBeVisible();
    expect(screen.getByText("Days away")).toBeVisible();
    expect(screen.getByText("4 days")).toBeVisible();
    expect(screen.queryByText("Ends")).not.toBeInTheDocument();
  });

  it.each([null, "invalid", "2026-09-03"])("shows an unknown duration for end date %s", async (endDate) => {
    render(await UpcomingTripSection({ plan: { ...plan, endDate } }));
    const duration = screen.getByText("Duration").parentElement;
    expect(duration).toHaveTextContent("TBD");
  });

  it("uses the supplied calendar day when rendering a trip in progress", async () => {
    render(await UpcomingTripSection({ plan, today: new Date("2026-09-06T00:00:00") }));
    expect(screen.getByText("Trip in progress")).toBeVisible();
    expect(screen.getByText("Ends")).toBeVisible();
  });

  it("ignores undated, invalid and finished trips", () => {
    expect(
      getHighlightedPlan([
        { ...plan, startDate: null },
        { ...plan, startDate: "invalid" },
        { ...plan, startDate: "2026-08-31", endDate: "invalid" },
        { ...plan, startDate: "2026-08-31", endDate: null },
        { ...plan, startDate: "2026-08-30", endDate: "2026-08-31" },
      ])
    ).toBeNull();
  });

  it("renders an ongoing trip with its end date instead of a departure countdown", async () => {
    render(
      await UpcomingTripSection({
        plan: { ...plan, destination: "Rome", startDate: "2026-08-31", endDate: "2026-09-03" },
      })
    );
    expect(screen.getByRole("heading", { name: "Rome" })).toBeVisible();
    expect(screen.getByText("Trip in progress")).toBeVisible();
    expect(screen.getByText("Ends")).toBeVisible();
    expect(screen.queryByText("Days away")).not.toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", `/p/${plan.id}`);
  });
});
