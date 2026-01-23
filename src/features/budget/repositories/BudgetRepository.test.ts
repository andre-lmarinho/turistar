import { describe, expect, it } from "vitest";

import { mapEntries } from "./BudgetRepository";

describe("BudgetRepository mapEntries", () => {
  it("maps rows to Entry objects with valid categories", () => {
    const rows = [
      { id: "e1", description: "Hotel", category: "lodging", amount: 200 },
      { id: "e2", description: "Train", category: "transport", amount: 100 },
    ];

    const result = mapEntries(rows);

    expect(result).toEqual([
      { id: "e1", description: "Hotel", category: "lodging", amount: 200 },
      { id: "e2", description: "Train", category: "transport", amount: 100 },
    ]);
  });

  it("defaults invalid category to transport", () => {
    const rows = [{ id: "e1", description: "Unknown", category: "invalid", amount: 50 }];

    const result = mapEntries(rows);

    expect(result[0].category).toBe("transport");
  });

  it("handles null category", () => {
    const rows = [{ id: "e1", description: "Test", category: null, amount: 50 }];

    const result = mapEntries(rows);

    expect(result[0].category).toBe("transport");
  });

  it("handles empty array input", () => {
    const rows: Array<{
      id: string;
      description: string | null;
      category: string | null;
      amount: number | null;
    }> = [];

    const result = mapEntries(rows);

    expect(result).toEqual([]);
  });

  it("handles undefined category", () => {
    const rows = [{ id: "e1", description: "Test", category: undefined as unknown as string, amount: 50 }];

    const result = mapEntries(rows);

    expect(result[0].category).toBe("transport");
  });

  it("handles empty string category", () => {
    const rows = [{ id: "e1", description: "Test", category: "", amount: 50 }];

    const result = mapEntries(rows);

    expect(result[0].category).toBe("transport");
  });
});
