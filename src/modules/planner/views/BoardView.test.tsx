import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Activity, DayPlan } from "@/features/activity/types";

import { BoardView } from "./BoardView";

const shared = vi.hoisted(() => ({
  useDragHandlersMock: vi.fn(),
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  closestCenter: vi.fn(() => []),
  pointerWithin: vi.fn(() => []),
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock("@dnd-kit/utilities", () => ({ CSS: { Transform: { toString: () => undefined } } }));

vi.mock("@/modules/planner/hooks/useDragHandlers", () => ({
  useDragHandlers: (...args: unknown[]) => shared.useDragHandlersMock(...args),
}));

const activity: Activity = { id: "a1", title: "Museum", color: "bg-[var(--color-1)]" };
const days: DayPlan[] = [
  { id: "d1", label: "Mon, 05 Jul", activities: [activity] },
  { id: "d2", label: "Tue, 06 Jul", activities: [] },
];

beforeEach(() => {
  shared.useDragHandlersMock.mockReturnValue({
    previewDays: days,
    activeId: null,
    sensors: [],
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragCancel: vi.fn(),
  });
});

describe("BoardView", () => {
  it("renders days and activities", () => {
    render(<BoardView days={days} />);

    expect(screen.getByText("Mon, 05 Jul")).toBeInTheDocument();
    expect(screen.getByText("Museum")).toBeInTheDocument();
    expect(screen.getByText("Tue, 06 Jul")).toBeInTheDocument();
  });

  it("delegates adding an activity to the dialog callback", () => {
    const onAddActivity = vi.fn();
    render(<BoardView days={days} onFallbackAdd={onAddActivity} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Add activity" })[0]);

    expect(onAddActivity).toHaveBeenCalledWith("d1", 1);
  });
});

it.each(["preview", "removed"])(
  "renders the current preview and resolves its overlay by ID (%s)",
  (activeId) => {
    const preview = { id: "preview", title: "New remote title", color: "blue" };
    const state = shared.useDragHandlersMock();
    shared.useDragHandlersMock.mockReturnValue({
      ...state,
      activeId,
      previewDays: [{ ...days[0], activities: [activity, preview] }],
    });
    render(<BoardView days={days} />);
    expect(screen.getAllByText("New remote title")).toHaveLength(activeId === "preview" ? 2 : 1);
    expect(screen.getAllByText("Museum")).toHaveLength(1);
  }
);

it("selects an activity with its current day", () => {
  const select = vi.fn();
  render(<BoardView days={days} onActivitySelect={select} />);
  fireEvent.click(screen.getByRole("button", { name: "Museum" }));
  expect(select).toHaveBeenCalledExactlyOnceWith(activity, "d1");
});

it("stops background drag scrolling when the mouse is released", () => {
  render(<BoardView days={days} />);
  const board = screen.getByRole("list", { name: "Days" });
  fireEvent.mouseDown(board, { clientX: 100 });
  fireEvent.mouseMove(document, { clientX: 40 });
  expect(board.scrollLeft).toBe(60);
  fireEvent.mouseUp(document);
  fireEvent.mouseMove(document, { clientX: 0 });
  expect(board.scrollLeft).toBe(60);
});
