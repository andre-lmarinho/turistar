import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Activity, DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";
import * as placeholders from "@/features/app/planner/domain/utils/activityPlaceholders";
import { useActivityState } from "@/features/app/planner/hooks/state/dnd/useActivityState";
import { usePersistedPlannerDays } from "@/features/app/planner/hooks/state/planner/usePersistedPlannerDays";
import { useSelectedActivity } from "./useSelectedActivity";

function usePlannerHarness(initialDays: DayPlan[], mutateAsync: (state: DayPlan[]) => Promise<unknown>) {
  const [days, setDays] = useState<DayPlan[]>(initialDays);
  const activityState = useActivityState(setDays);
  const selected = useSelectedActivity(days, setDays, activityState);

  usePersistedPlannerDays({
    planner: { days, setDays },
    persistDays: { mutateAsync, isPending: false },
    storedDays: initialDays,
  });

  return {
    days,
    setDays,
    selectedActivity: selected.selectedActivity,
    addBlankAndSelect: selected.addBlankAndSelect,
    closeDialog: selected.closeDialog,
    save: selected.save,
    changeDay: selected.changeDay,
    changePosition: selected.changePosition,
    setSelectedActivity: selected.setSelectedActivity,
  };
}

describe("useSelectedActivity blank placeholders", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not enqueue persistence when cancelling a brand new card", async () => {
    vi.useFakeTimers();
    const persistSpy = vi.fn<(state: DayPlan[]) => Promise<unknown>>().mockResolvedValue(undefined);
    const initialDays: DayPlan[] = [{ id: "day-1", label: "Day 1", activities: [] }];

    const { result } = renderHook(() => usePlannerHarness(initialDays, persistSpy));

    await act(async () => {
      result.current.addBlankAndSelect("day-1");
    });

    expect(result.current.days[0].activities).toHaveLength(0);

    await act(async () => {
      result.current.closeDialog();
    });

    expect(result.current.days[0].activities).toHaveLength(0);

    await act(async () => {
      vi.advanceTimersByTime(600);
      await Promise.resolve();
    });

    expect(persistSpy).not.toHaveBeenCalled();
  });

  it("creates a persisted activity at the reserved index on save", async () => {
    const idSpy = vi.spyOn(placeholders, "generateClientActivityId").mockReturnValue("generated-id");
    const persistSpy = vi.fn<(state: DayPlan[]) => Promise<unknown>>().mockResolvedValue(undefined);
    const initialDays: DayPlan[] = [
      {
        id: "day-1",
        label: "Day 1",
        activities: [
          { id: "a", title: "Breakfast", color: "#f00" },
          { id: "b", title: "Dinner", color: "#0f0" },
        ],
      },
    ];

    const { result } = renderHook(() => usePlannerHarness(initialDays, persistSpy));

    await act(async () => {
      result.current.addBlankAndSelect("day-1", 1);
    });

    await act(async () => {
      result.current.save({ title: "City tour" });
    });

    const activities = result.current.days[0].activities;
    expect(activities).toHaveLength(3);
    expect(activities[1].id).toBe("generated-id");
    expect(activities[1].title).toBe("City tour");

    idSpy.mockRestore();
  });

  it("saves a new card into a different day after changing the selected day", async () => {
    const idSpy = vi.spyOn(placeholders, "generateClientActivityId").mockReturnValue("activity-123");
    const persistSpy = vi.fn<(state: DayPlan[]) => Promise<unknown>>().mockResolvedValue(undefined);
    const initialDays: DayPlan[] = [
      { id: "day-1", label: "Day 1", activities: [{ id: "a", title: "Breakfast", color: "#f00" }] },
      { id: "day-2", label: "Day 2", activities: [{ id: "b", title: "Dinner", color: "#0f0" }] },
    ];

    const { result } = renderHook(() => usePlannerHarness(initialDays, persistSpy));

    await act(async () => {
      result.current.addBlankAndSelect("day-1");
    });

    const pendingId = result.current.selectedActivity?.id;
    expect(pendingId).toBeTruthy();

    await act(async () => {
      if (pendingId) {
        result.current.changeDay(pendingId, "day-2");
      }
    });

    await act(async () => {
      result.current.save({ title: "Museum" });
    });

    expect(result.current.days[0].activities).toHaveLength(1);
    expect(result.current.days[1].activities).toHaveLength(2);
    expect(result.current.days[1].activities[1].id).toBe("activity-123");
    expect(result.current.days[1].activities[1].title).toBe("Museum");

    idSpy.mockRestore();
  });

  it("removes blank activities that arrive from the server when closing the dialog", async () => {
    const persistSpy = vi.fn<(state: DayPlan[]) => Promise<unknown>>().mockResolvedValue(undefined);
    const initialDays: DayPlan[] = [{ id: "day-1", label: "Day 1", activities: [] }];

    const { result } = renderHook(() => usePlannerHarness(initialDays, persistSpy));

    const serverActivity: Activity = {
      id: "server-activity-1",
      title: "",
      description: "",
      duration: 0,
      color: "#ffffff",
      budget: 0,
      category: "",
    };

    await act(async () => {
      result.current.setDays([{ id: "day-1", label: "Day 1", activities: [serverActivity] }]);
      result.current.setSelectedActivity({ ...serverActivity, dayId: "day-1" });
    });

    await act(async () => {
      result.current.closeDialog();
    });

    expect(result.current.days[0].activities).toHaveLength(0);
  });
});
