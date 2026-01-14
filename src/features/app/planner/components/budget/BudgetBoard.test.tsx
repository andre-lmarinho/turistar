import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";

import { PlannerProvider } from "@/features/app/planner/hooks/PlannerContext";
import { BudgetBoard } from "./BudgetBoard";

const state = vi.hoisted(() => ({
  days: [] as DayPlan[],
}));

const actions = vi.hoisted(() => ({
  getPlanBudget: vi.fn(),
  updatePlanBudget: vi.fn(),
  createBudgetEntry: vi.fn(),
  updateBudgetEntry: vi.fn(),
  deleteBudgetEntry: vi.fn(),
}));

vi.mock("@/features/app/planner/server/actions/plans/getPlanBudget", () => ({
  getPlanBudget: actions.getPlanBudget,
}));
vi.mock("@/features/app/planner/server/actions/plans/updatePlanBudget", () => ({
  updatePlanBudget: actions.updatePlanBudget,
}));
vi.mock("@/features/app/planner/server/actions/plans/createBudgetEntry", () => ({
  createBudgetEntry: actions.createBudgetEntry,
}));
vi.mock("@/features/app/planner/server/actions/plans/updateBudgetEntry", () => ({
  updateBudgetEntry: actions.updateBudgetEntry,
}));
vi.mock("@/features/app/planner/server/actions/plans/deleteBudgetEntry", () => ({
  deleteBudgetEntry: actions.deleteBudgetEntry,
}));

const supabase = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/shared/lib/supabaseClient", () => ({
  supabase: { from: (table: string) => supabase.from(table) },
}));

vi.mock("@/features/app/planner/hooks/PlannerContext", async () => {
  const React = await import("react");
  return {
    __esModule: true,
    PlannerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    usePlannerContext: () => ({
      planId: "p1",
      days: state.days,
      updateActivity: vi.fn(),
      setSelectedActivity: vi.fn(),
      changeDay: vi.fn(),
      changePosition: vi.fn(),
      changeColor: vi.fn(),
      insertActivityAt: vi.fn(),
      replaceActivity: vi.fn(),
      removeActivity: vi.fn(),
      addBlankAndSelect: vi.fn(),
      sensors: undefined,
      collisionDetection: vi.fn(),
      handleDragStart: vi.fn(),
      handleDragOver: vi.fn(),
      handleDragEnd: vi.fn(),
      selectedActivity: null,
      setDays: vi.fn(),
      currentRange: undefined,
      handleRangeChange: vi.fn(),
      canEdit: true,
    }),
  };
});

vi.mock("@/features/app/planner/hooks/usePlanner", () => ({
  usePlanner: () => ({
    planId: "p1",
    dest: "rome",
    days: state.days,
    destCoords: null,
    setDays: vi.fn(),
    currentRange: undefined,
    handleRangeChange: vi.fn(),
    activeId: null,
    sensors: [],
    collisionDetection: vi.fn(),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    addActivity: vi.fn(),
    removeActivity: vi.fn(),
    updateActivity: vi.fn(),
    addBlankActivity: vi.fn(),
    insertActivityAt: vi.fn(),
    replaceActivity: vi.fn(),
  }),
}));

vi.mock("@/features/app/planner/hooks/useSelectedActivity", () => ({
  useSelectedActivity: () => ({
    selectedActivity: null,
    setSelectedActivity: vi.fn(),
    changeDay: vi.fn(),
    changePosition: vi.fn(),
    addBlankAndSelect: vi.fn(),
    closeDialog: vi.fn(),
    save: vi.fn(),
    deleteActivity: vi.fn(),
    changeColor: vi.fn(),
  }),
}));

function renderBudgetBoard(days: DayPlan[]) {
  state.days = days;
  return render(
    <PlannerProvider planId="p1">
      <BudgetBoard />
    </PlannerProvider>
  );
}

describe("BudgetBoard", () => {
  beforeEach(() => {
    state.days = [];
    supabase.from.mockReset();

    actions.getPlanBudget.mockReset();
    actions.updatePlanBudget.mockReset();
    actions.createBudgetEntry.mockReset();
    actions.updateBudgetEntry.mockReset();
    actions.deleteBudgetEntry.mockReset();
  });

  it("adds expenses and updates totals", async () => {
    actions.getPlanBudget.mockResolvedValue({ budget: 0, entries: [] });
    actions.updatePlanBudget.mockResolvedValue(0);
    actions.createBudgetEntry.mockResolvedValue("e1");

    renderBudgetBoard([
      {
        id: "d1",
        label: "Day 1",
        activities: [{ id: "a1", title: "Act", color: "bg-[var(--color-1)]", budget: 25 }],
      },
    ]);

    await waitFor(() => expect(screen.getByText("Total spent: $25.00")).toBeInTheDocument());

    expect(actions.updatePlanBudget).not.toHaveBeenCalled();
    expect(screen.queryByText("Failed to persist budget")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "Taxi" },
    });
    fireEvent.change(screen.getByPlaceholderText("Amount"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByLabelText("Add expense"));

    await waitFor(() => expect(actions.createBudgetEntry).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Total spent: $75.00")).toBeInTheDocument());
  });
});
