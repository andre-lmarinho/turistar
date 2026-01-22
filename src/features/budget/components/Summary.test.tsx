import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { BudgetProvider } from "../hooks/BudgetContext";
import { Summary } from "./Summary";

const mocks = vi.hoisted(() => ({
  getPlanBudget: vi.fn(),
  updatePlanBudget: vi.fn(),
  createBudgetEntry: vi.fn(),
  updateBudgetEntry: vi.fn(),
  deleteBudgetEntry: vi.fn(),
}));

vi.mock("@/features/budget/services/BudgetService", () => ({
  getPlanBudget: mocks.getPlanBudget,
  updatePlanBudget: mocks.updatePlanBudget,
  createBudgetEntry: mocks.createBudgetEntry,
  updateBudgetEntry: mocks.updateBudgetEntry,
  deleteBudgetEntry: mocks.deleteBudgetEntry,
}));

describe("BudgetSummary", () => {
  beforeEach(() => {
    mocks.getPlanBudget.mockReset();
    mocks.updatePlanBudget.mockReset();
    mocks.createBudgetEntry.mockReset();
    mocks.updateBudgetEntry.mockReset();
    mocks.deleteBudgetEntry.mockReset();
  });

  it("displays stored plan budget on load", async () => {
    mocks.getPlanBudget.mockResolvedValue({ budget: 123, entries: [] });

    render(
      <BudgetProvider planId="p1" activitiesTotal={0} initialBudget={123}>
        <Summary />
      </BudgetProvider>
    );

    expect(screen.getByPlaceholderText("Budget")).toHaveValue("123");
  });
});
