import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Activity, DayPlan } from "@/features/activity/types";

import type { DayColumnProps } from "../types";
import { ActivityBoard } from "./ActivityBoard";
import type { DraggableCardProps } from "./DraggableCard";

const shared = vi.hoisted(() => ({
  dayColumnSpy: vi.fn(),
  draggableCardSpy: vi.fn(),
  useDragHandlersMock: vi.fn(),
  getActivityMock: vi.fn(),
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  closestCenter: vi.fn(() => []),
  pointerWithin: vi.fn(() => []),
}));

vi.mock("@/features/activity/lib/activityOperations", () => ({
  getActivity: (...args: unknown[]) => shared.getActivityMock(...args),
}));

vi.mock("../hooks/useDragHandlers", () => ({
  useDragHandlers: (...args: unknown[]) => shared.useDragHandlersMock(...args),
}));

vi.mock("./DayColumn", () => ({
  DayColumn: (props: DayColumnProps) => {
    shared.dayColumnSpy(props);
    return <div data-testid={`day-${props.day.id}`} />;
  },
}));

vi.mock("./DraggableCard", () => ({
  DraggableCard: (props: DraggableCardProps) => {
    shared.draggableCardSpy(props);
    return <div data-testid={`drag-${props.id}`} />;
  },
}));

const baseActivity: Activity = {
  id: "a1",
  title: "Cafe",
  color: "bg-[var(--color-1)]",
};

const baseDays: DayPlan[] = [
  { id: "d1", label: "Day 1", activities: [baseActivity] },
  { id: "d2", label: "Day 2", activities: [] },
];

describe("ActivityBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shared.useDragHandlersMock.mockReset();
    shared.getActivityMock.mockReset();
  });

  it("passes onActivitySelect directly to DayColumn", () => {
    const handleSelect = vi.fn();

    shared.useDragHandlersMock.mockReturnValue({
      activeId: null,
      sensors: [],
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      handleDragCancel: vi.fn(),
    });

    render(<ActivityBoard days={baseDays} onActivitySelect={handleSelect} />);

    expect(shared.dayColumnSpy).toHaveBeenCalledTimes(2);
    expect(shared.dayColumnSpy.mock.calls[0]?.[0].onActivitySelect).toBe(handleSelect);
  });

  it("renders drag overlay card when activeId is set", () => {
    shared.useDragHandlersMock.mockReturnValue({
      activeId: "a1",
      sensors: [],
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      handleDragCancel: vi.fn(),
    });
    shared.getActivityMock.mockReturnValue(baseActivity);

    render(<ActivityBoard days={baseDays} />);

    expect(shared.getActivityMock).toHaveBeenCalledWith(baseDays, "a1");
    expect(shared.draggableCardSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: "a1", activity: baseActivity, dragOverlay: true })
    );
  });
});
