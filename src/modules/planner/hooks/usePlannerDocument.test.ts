import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DayPlan } from "@/features/activity/types";
import { usePlanCollaboration } from "@/features/events/hooks/usePlanCollaboration";
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

describe("usePlannerDocument", () => {
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
