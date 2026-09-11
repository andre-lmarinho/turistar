import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Activity, DayPlan } from "@/features/activity/types";
import { usePlanCollaboration } from "@/features/events/hooks/usePlanCollaboration";
import type { PlanOperation } from "@/features/events/types";
import { usePlannerDocument } from "./usePlannerDocument";

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock("@/features/events/hooks/usePlanCollaboration", () => ({
  usePlanCollaboration: vi.fn(),
}));

const mockedUsePlanCollaboration = vi.mocked(usePlanCollaboration);

const days: DayPlan[] = [
  {
    id: "2025-01-10",
    label: "Fri, 10 Jan",
    activities: [
      {
        id: "activity-1",
        title: "Check-in",
        description: "",
        startTime: "09:00",
        duration: 60,
        color: "blue",
      },
    ],
  },
  {
    id: "2025-01-11",
    label: "Sat, 11 Jan",
    activities: [],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.fetch.mockResolvedValue({ ok: false } as Response);
  mockedUsePlanCollaboration.mockReturnValue({
    data: days,
    isLoading: false,
    error: undefined,
    version: 1,
    retryPending: async () => undefined,
    hasPendingChanges: false,
    dispatch: mocks.dispatch,
    discardPending: vi.fn(),
    isPending: false,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("usePlannerDocument", () => {
  it("rejects blank activities without queuing an event", () => {
    const { result } = renderHook(() => usePlannerDocument({ planId: "plan-1", initialDays: days }));
    expect(result.current.createActivity(days[0].id, { id: "new", title: "  ", color: "blue" })).toBe(false);
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("deletes by activity ID without depending on its previous day", () => {
    const { result } = renderHook(() => usePlannerDocument({ planId: "plan-1", initialDays: days }));
    act(() => result.current.deleteActivity("activity-1"));
    expect(mocks.dispatch.mock.calls[0][0]([])).toEqual([
      { type: "activity.deleted", payload: { activityId: "activity-1" } },
    ]);
  });

  it.each([{ data: [] }, { data: [{ ...days[0], id: "invalid-date" }] }])(
    "omits the date range for unusable dates (%j)",
    ({ data }) => {
      const state = mockedUsePlanCollaboration("plan-1");
      mockedUsePlanCollaboration.mockReturnValue({ ...state, data });
      const { result } = renderHook(() => usePlannerDocument({ planId: "plan-1", initialDays: days }));
      expect(result.current.currentRange).toBeUndefined();
    }
  );

  it("seeds three consecutive days when the plan has no initial document", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-11T12:00:00Z"));
    renderHook(() => usePlannerDocument({ planId: "plan-1" }));
    expect(mockedUsePlanCollaboration.mock.calls.at(-1)?.[1]?.initialDays?.map((day) => day.id)).toEqual([
      "2026-09-11",
      "2026-09-12",
      "2026-09-13",
    ]);
  });

  it("ignores cleared ranges and treats a start date alone as a one-day trip", () => {
    const { result } = renderHook(() => usePlannerDocument({ planId: "plan-1", initialDays: days }));
    act(() => {
      result.current.handleRangeChange(undefined);
      result.current.handleRangeChange({ from: undefined });
    });
    expect(mocks.dispatch).not.toHaveBeenCalled();
    act(() => result.current.handleRangeChange({ from: new Date("2025-01-10T00:00:00Z") }));
    expect(mocks.dispatch.mock.calls[0][0](days)).toContainEqual({
      type: "day.removed",
      payload: { dayId: "2025-01-11" },
    });
  });
  it("uses the collaboration state as the document and derives its date range", () => {
    const { result } = renderHook(() =>
      usePlannerDocument({
        planId: "plan-1",
        initialDays: days,
        dest: "Salvador",
        viewerUserId: "user-1",
      })
    );

    expect(result.current.days).toEqual(days);
    expect(result.current.dest).toBe("Salvador");
    expect(result.current.currentRange).toEqual({
      from: new Date("2025-01-10T00:00:00.000Z"),
      to: new Date("2025-01-11T00:00:00.000Z"),
    });
    expect(mockedUsePlanCollaboration).toHaveBeenCalledWith("plan-1", {
      enabled: true,
      actorId: "user-1",
      initialDays: days,
    });
  });

  it("builds activity intents against the latest document supplied by dispatch", () => {
    const { result } = renderHook(() => usePlannerDocument({ planId: "plan-1", initialDays: days }));
    act(() => result.current.moveActivity("activity-1", { toDayId: days[1].id }));
    const build = mocks.dispatch.mock.calls[0][0];
    expect(build(days)).toEqual([expect.objectContaining({ type: "activity.moved" })]);
    expect(build([])).toEqual([]);
  });

  it("emits explicit date range events", () => {
    const { result } = renderHook(() => usePlannerDocument({ planId: "plan-1", initialDays: days }));
    act(() =>
      result.current.handleRangeChange({
        from: new Date("2025-01-10T00:00:00Z"),
        to: new Date("2025-01-12T00:00:00Z"),
      })
    );
    expect(mocks.dispatch.mock.calls[0][0](days)).toContainEqual(
      expect.objectContaining({
        type: "day.created",
        payload: { day: expect.objectContaining({ id: "2025-01-12" }) },
      })
    );
  });

  it("loads destination coordinates when editing", async () => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ latitude: -12.97, longitude: -38.5 }] }),
    } as Response);

    const { result } = renderHook(() =>
      usePlannerDocument({ planId: "plan-1", initialDays: days, dest: "Salvador" })
    );

    await waitFor(() => expect(result.current.destCoords).toEqual({ lat: -12.97, lng: -38.5 }));
    expect(mocks.fetch).toHaveBeenCalledWith(
      "/api/places/city-country?text=Salvador",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });
});

it("encodes clearing coordinates explicitly and preserves a sparse field patch", () => {
  const { result } = renderHook(() => usePlannerDocument({ planId: "plan-1", initialDays: days }));
  act(() =>
    result.current.updateActivity("activity-1", {
      address: "Changed",
      latitude: undefined,
      longitude: undefined,
    })
  );
  expect(mocks.dispatch.mock.calls[0][0](days)).toEqual([
    {
      type: "activity.updated",
      payload: { activityId: "activity-1", patch: { address: "Changed", latitude: null, longitude: null } },
    },
  ]);
});

it.each([true, false])(
  "reports whether creation was accepted against the latest days (%s)",
  (dayStillExists) => {
    mocks.dispatch.mockImplementationOnce(
      (build: (current: DayPlan[]) => PlanOperation[]) => build(dayStillExists ? days : []).length > 0
    );
    const { result } = renderHook(() => usePlannerDocument({ planId: "plan-1", initialDays: days }));
    const activity: Activity = { id: "new", title: "Museum", color: "blue" };
    let accepted: unknown;
    act(() => {
      accepted = result.current.createActivity(days[0].id, activity);
    });
    expect(accepted).toBe(dayStillExists);
  }
);
