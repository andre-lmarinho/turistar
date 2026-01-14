import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { useBudget } from "./useBudget";

const mocks = vi.hoisted(() => ({
  getPlanBudget: vi.fn(),
  updatePlanBudget: vi.fn(),
  createBudgetEntry: vi.fn(),
  updateBudgetEntry: vi.fn(),
  deleteBudgetEntry: vi.fn(),
}));

vi.mock("@/features/app/planner/server/actions/plans/getPlanBudget", () => ({
  getPlanBudget: mocks.getPlanBudget,
}));
vi.mock("@/features/app/planner/server/actions/plans/updatePlanBudget", () => ({
  updatePlanBudget: mocks.updatePlanBudget,
}));
vi.mock("@/features/app/planner/server/actions/plans/createBudgetEntry", () => ({
  createBudgetEntry: mocks.createBudgetEntry,
}));
vi.mock("@/features/app/planner/server/actions/plans/updateBudgetEntry", () => ({
  updateBudgetEntry: mocks.updateBudgetEntry,
}));
vi.mock("@/features/app/planner/server/actions/plans/deleteBudgetEntry", () => ({
  deleteBudgetEntry: mocks.deleteBudgetEntry,
}));

describe("useBudget hook", () => {
  beforeEach(() => {
    mocks.getPlanBudget.mockReset();
    mocks.updatePlanBudget.mockReset();
    mocks.createBudgetEntry.mockReset();
    mocks.updateBudgetEntry.mockReset();
    mocks.deleteBudgetEntry.mockReset();
  });

  test("does not persist budget on initial load", async () => {
    mocks.getPlanBudget.mockResolvedValue({ budget: 100, entries: [] });

    const { result } = renderHook(() => useBudget("p1", 0));
    await waitFor(() => expect(result.current.hasLoaded).toBe(true));
    expect(mocks.updatePlanBudget).not.toHaveBeenCalled();
    expect(result.current.persistError).toBeNull();
  });

  test("persists entries via budget_entries table", async () => {
    mocks.getPlanBudget.mockResolvedValue({
      budget: 0,
      entries: [{ id: "e1", description: "Lunch", category: "food", amount: 10 }],
    });
    mocks.updatePlanBudget.mockResolvedValue(0);
    mocks.createBudgetEntry.mockResolvedValue("e2");
    mocks.updateBudgetEntry.mockResolvedValue(undefined);
    mocks.deleteBudgetEntry.mockResolvedValue(undefined);

    const { result } = renderHook(() => useBudget("p1", 0));
    await waitFor(() => expect(result.current.hasLoaded).toBe(true));
    expect(result.current.entries).toHaveLength(1);

    await act(async () => {
      result.current.setDesc("Coffee");
      result.current.setCat("food");
      result.current.setAmount(5);
    });
    await act(async () => {
      await result.current.handleAdd();
    });
    expect(mocks.createBudgetEntry).toHaveBeenCalled();
    expect(result.current.entries).toHaveLength(2);

    await act(async () => {
      const updated = { ...result.current.entries[0], amount: 12 };
      await result.current.handleUpdateEntry(0, updated);
    });
    expect(mocks.updateBudgetEntry).toHaveBeenCalled();

    await act(async () => {
      await result.current.handleDeleteEntry(0);
    });
    expect(mocks.deleteBudgetEntry).toHaveBeenCalled();
  });

  test("sets persistError when Supabase insert fails", async () => {
    mocks.getPlanBudget.mockResolvedValue({ budget: 0, entries: [] });
    mocks.updatePlanBudget.mockResolvedValue(0);
    mocks.createBudgetEntry.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useBudget("p1", 0));
    await waitFor(() => expect(result.current.hasLoaded).toBe(true));

    await act(async () => {
      result.current.setDesc("Coffee");
      result.current.setAmount(5);
    });
    await act(async () => {
      await result.current.handleAdd();
    });

    await waitFor(() =>
      expect(result.current.persistError).toBe("Failed to create budget entry: planId=p1 category=transport")
    );
  });
});
