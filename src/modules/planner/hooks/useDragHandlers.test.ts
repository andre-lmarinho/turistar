import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DayPlan } from "@/features/activity/types";
import { useDragHandlers } from "./useDragHandlers";

const createMockDay = (id: string, activities: string[]): DayPlan => ({
  id,
  label: `Day ${id}`,
  position: "1024",
  activities: activities.map((aid, index) => ({
    id: aid,
    title: `Activity ${aid}`,
    color: "bg-[var(--color-0)]",
    position: String((index + 1) * 1024),
    description: "",
    address: "",
    duration: 60,
  })),
});

const mockDays: DayPlan[] = [createMockDay("1", ["a1", "a2"]), createMockDay("2", ["a3"])];

describe("useDragHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with null activeId", () => {
    const { result } = renderHook(() => useDragHandlers(mockDays));
    expect(result.current.activeId).toBeNull();
  });

  it("returns sensors configuration", () => {
    const { result } = renderHook(() => useDragHandlers(mockDays));
    expect(result.current.sensors).toBeDefined();
    expect(result.current.sensors.length).toBe(2);
  });

  it("returns all handler functions", () => {
    const { result } = renderHook(() => useDragHandlers(mockDays));

    expect(typeof result.current.handleDragStart).toBe("function");
    expect(typeof result.current.handleDragOver).toBe("function");
    expect(typeof result.current.handleDragEnd).toBe("function");
    expect(typeof result.current.handleDragCancel).toBe("function");
  });

  it("accepts custom days from props", () => {
    const customDays = [createMockDay("custom1", ["c1"]), createMockDay("custom2", ["c2", "c3"])];
    const { result } = renderHook(() => useDragHandlers(customDays));

    expect(result.current.activeId).toBeNull();
    expect(result.current.sensors).toBeDefined();
  });

  it("handleDragCancel does not throw when no active drag", () => {
    const { result } = renderHook(() => useDragHandlers(mockDays));

    expect(() => result.current.handleDragCancel()).not.toThrow();
  });

  it("handles empty days array", () => {
    const { result } = renderHook(() => useDragHandlers([]));

    expect(result.current.activeId).toBeNull();
    expect(typeof result.current.handleDragStart).toBe("function");
  });
});

it("projects the drag on new remote data and commits only an ID-based move", () => {
  const onActivityMove = vi.fn();
  const { result, rerender } = renderHook(({ days }) => useDragHandlers(days, { onActivityMove }), {
    initialProps: { days: mockDays },
  });
  act(() => result.current.handleDragStart({ active: { id: "a1" } } as DragStartEvent));
  act(() => result.current.handleDragOver({ active: { id: "a1" }, over: { id: "2" } } as DragOverEvent));
  expect(result.current.previewDays[1].activities.map((activity) => activity.id)).toContain("a1");
  const remoteDays = mockDays.map((day) => ({
    ...day,
    activities: day.activities.map((activity) =>
      activity.id === "a2" ? { ...activity, title: "Remote title" } : activity
    ),
  }));
  rerender({ days: remoteDays });
  expect(result.current.previewDays[0].activities[0].title).toBe("Remote title");
  act(() => result.current.handleDragEnd({ active: { id: "a1" }, over: null } as DragEndEvent));
  expect(onActivityMove).toHaveBeenCalledWith("a1", { toDayId: "2", beforeActivityId: undefined });
  expect(result.current.previewDays).toBe(remoteDays);
});

it("cancels preview without publishing a mutation", () => {
  const onActivityMove = vi.fn();
  const { result } = renderHook(() => useDragHandlers(mockDays, { onActivityMove }));
  act(() => result.current.handleDragStart({ active: { id: "a1" } } as DragStartEvent));
  act(() => result.current.handleDragOver({ active: { id: "a1" }, over: { id: "2" } } as DragOverEvent));
  act(() => result.current.handleDragCancel());
  expect(result.current.previewDays).toBe(mockDays);
  expect(onActivityMove).not.toHaveBeenCalled();
});

it.each([null, "a1", "missing"])("does not commit an invalid drop target (%s)", (target) => {
  const onActivityMove = vi.fn();
  const { result } = renderHook(() => useDragHandlers(mockDays, { onActivityMove }));
  act(() => result.current.handleDragStart({ active: { id: "a1" } } as DragStartEvent));
  act(() =>
    result.current.handleDragEnd({
      active: { id: "a1" },
      over: target ? { id: target } : null,
    } as DragEndEvent)
  );
  expect(onActivityMove).not.toHaveBeenCalled();
  expect(result.current.activeId).toBeNull();
  expect(result.current.previewDays).toBe(mockDays);
});

it("commits a drop before an activity without a preceding hover", () => {
  const onActivityMove = vi.fn();
  const { result } = renderHook(() => useDragHandlers(mockDays, { onActivityMove }));
  act(() => result.current.handleDragStart({ active: { id: "a3" } } as DragStartEvent));
  act(() => result.current.handleDragEnd({ active: { id: "a3" }, over: { id: "a2" } } as DragEndEvent));
  expect(onActivityMove).toHaveBeenCalledExactlyOnceWith("a3", { toDayId: "1", beforeActivityId: "a2" });
});
