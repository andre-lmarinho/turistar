import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Activity, DayPlan } from "@/features/activity/types";
import en from "@/i18n/locales/en.json";
import pt from "@/i18n/locales/pt-BR.json";
import { TripView } from "./TripView";

const shared = vi.hoisted(() => ({ useDragHandlers: vi.fn() }));
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
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
vi.mock("@dnd-kit/modifiers", () => ({ restrictToWindowEdges: vi.fn() }));
vi.mock("@/features/activity/hooks/useActivityColors", () => ({
  useActivityColors: () => ({ bg: "bg-[var(--color-1)]" }),
}));

vi.mock("@/modules/planner/hooks/useDragHandlers", () => ({
  useDragHandlers: (...args: unknown[]) => shared.useDragHandlers(...args),
}));
vi.mock("@/ui/components/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
const activity: Activity = { id: "activity-1", title: "Museum", color: "bg-[var(--color-1)]" };
const days: DayPlan[] = [
  { id: "2021-07-05", label: "Mon, Jul 05", activities: [activity] },
  { id: "2021-07-06", label: "Tue, Jul 06", activities: [] },
];
beforeEach(() => {
  shared.useDragHandlers.mockReturnValue({
    previewDays: days,
    activeId: null,
    sensors: [],
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragCancel: vi.fn(),
  });
});
describe("TripView", () => {
  it("renders the itinerary and selects an activity", () => {
    const onActivitySelect = vi.fn();
    render(
      <TripView
        days={days}
        onActivitySelect={onActivitySelect}
        onActivityMove={vi.fn()}
        onFallbackAdd={vi.fn()}
      />
    );
    expect(screen.getByText("Itinerary")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mon, Jul 05" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Museum" }));
    expect(onActivitySelect).toHaveBeenCalledWith(activity, "2021-07-05");
  });
  it("hides and restores the itinerary", () => {
    render(
      <TripView days={days} onActivitySelect={vi.fn()} onActivityMove={vi.fn()} onFallbackAdd={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Hide itinerary" }));
    expect(screen.getByRole("button", { name: "Show itinerary" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show itinerary" }));
    expect(screen.getByText("Itinerary")).toBeInTheDocument();
  });
  it("collapses all days and delegates adding", () => {
    const onFallbackAdd = vi.fn();
    render(
      <TripView
        days={days}
        onActivitySelect={vi.fn()}
        onActivityMove={vi.fn()}
        onFallbackAdd={onFallbackAdd}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Collapse all days" }));
    expect(screen.queryByText("Museum")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand all days" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Add activity" })[0]);
    expect(onFallbackAdd).toHaveBeenCalledWith("2021-07-05", 1);
  });
});

it.each(["preview", "removed"])(
  "renders the current preview and resolves its overlay by ID (%s)",
  (activeId) => {
    const preview = { id: "preview", title: "New remote title", color: "blue" };
    const state = shared.useDragHandlers();
    shared.useDragHandlers.mockReturnValue({
      ...state,
      activeId,
      previewDays: [{ ...days[0], activities: [activity, preview] }],
    });
    render(
      <TripView days={days} onActivitySelect={vi.fn()} onActivityMove={vi.fn()} onFallbackAdd={vi.fn()} />
    );
    expect(screen.getAllByText("New remote title")).toHaveLength(activeId === "preview" ? 2 : 1);
    expect(screen.getAllByText("Museum")).toHaveLength(1);
  }
);

it("supports keyboard selection and hovering without selecting from the drag handle", () => {
  const select = vi.fn();
  const hover = vi.fn();
  render(
    <TripView
      days={days}
      onActivitySelect={select}
      onActivityMove={vi.fn()}
      onFallbackAdd={vi.fn()}
      onActivityHover={hover}
    />
  );
  const card = screen.getByRole("button", { name: "Museum" });
  fireEvent.mouseEnter(card);
  expect(hover).toHaveBeenLastCalledWith("activity-1");
  fireEvent.mouseLeave(card);
  expect(hover).toHaveBeenLastCalledWith(null);
  fireEvent.click(screen.getByRole("button", { name: "Reorder activity Museum" }));
  expect(select).not.toHaveBeenCalled();
  fireEvent.keyDown(card, { key: "Enter" });
  expect(select).toHaveBeenCalledWith(activity, "2021-07-05");
});

it("expands a collapsed day when adding an activity", () => {
  const add = vi.fn();
  render(<TripView days={days} onActivitySelect={vi.fn()} onActivityMove={vi.fn()} onFallbackAdd={add} />);
  fireEvent.click(screen.getAllByRole("button", { name: "Collapse day" })[0]);
  expect(screen.queryByText("Museum")).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("button", { name: "Add activity" })[0]);
  expect(screen.getByText("Museum")).toBeInTheDocument();
  expect(add).toHaveBeenCalledWith("2021-07-05", 1);
});

it("changes the date language without shifting the trip day in a western timezone", () => {
  const view = (
    <TripView days={days} onActivitySelect={vi.fn()} onActivityMove={vi.fn()} onFallbackAdd={vi.fn()} />
  );
  const { rerender } = render(
    <NextIntlClientProvider locale="en" messages={en} timeZone="America/Sao_Paulo">
      {view}
    </NextIntlClientProvider>
  );
  expect(screen.getByRole("heading", { name: "Mon, Jul 05" })).toBeVisible();
  rerender(
    <NextIntlClientProvider locale="pt-BR" messages={pt} timeZone="America/Sao_Paulo">
      {view}
    </NextIntlClientProvider>
  );
  expect(screen.getByRole("heading", { name: "seg., 05 de jul." })).toBeVisible();
});
