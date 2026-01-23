import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CategoryKey, Entry } from "../types";
import { BudgetProvider, useBudgetContext } from "./BudgetContext";
import { useBudget } from "./useBudget";

describe("BudgetContext", () => {
  it("is exported as a function (useBudgetContext)", () => {
    expect(typeof useBudgetContext).toBe("function");
  });

  it("BudgetProvider is exported", () => {
    expect(typeof BudgetProvider).toBe("function");
  });
});

describe("useBudget hook", () => {
  it("is exported as a function", () => {
    expect(typeof useBudget).toBe("function");
  });

  it("returns expected properties", () => {
    const { result } = renderHook(() => useBudget("plan-1", 100, {}));

    const { current } = result;

    expect(current.budget).toBe(0);
    expect(current.entries).toEqual([]);
    expect(current.categoryTotals).toBeDefined();
    expect(typeof current.categoryTotals).toBe("object");
    expect(current.categoryTotals).not.toBeNull();
    expect(typeof current.totalSpent).toBe("number");
    expect(typeof current.difference).toBe("number");
    expect(current.desc).toBe("");
    expect(current.cat).toBe("transport");
    expect(current.amount).toBe(0);

    expect(typeof current.setBudget).toBe("function");
    expect(typeof current.setDesc).toBe("function");
    expect(typeof current.setCat).toBe("function");
    expect(typeof current.setAmount).toBe("function");

    expect(typeof current.handleAdd).toBe("function");
    expect(typeof current.handleUpdateEntry).toBe("function");
    expect(typeof current.handleDeleteEntry).toBe("function");
  });

  it("handles initial values", () => {
    const initialEntries: Entry[] = [
      { id: "e1", description: "Hotel", category: "lodging" as CategoryKey, amount: 200 },
    ];

    const { result } = renderHook(() => useBudget("plan-1", 1000, { initialBudget: 500, initialEntries }));

    expect(result.current.budget).toBe(500);
    expect(result.current.entries).toHaveLength(1);
  });

  it("includes activitiesTotal in category totals", () => {
    const { result } = renderHook(() => useBudget("plan-1", 1000, {}));

    expect(result.current.categoryTotals.activities).toBe(1000);
  });
});
