import { describe, expect, it, vi } from "vitest";

import type { BudgetRepository } from "../repositories/BudgetRepository";
import { BudgetService } from "./BudgetService";

function makeService(repo: Partial<BudgetRepository>): BudgetService {
  return new BudgetService(repo as BudgetRepository);
}

describe("BudgetService", () => {
  describe("getPlanBudget", () => {
    it("maps persisted entry rows and keeps a null budget at zero", async () => {
      const service = makeService({
        fetchPlanBudgetRow: vi.fn().mockResolvedValue({ budget: null }),
        fetchPlanBudgetEntries: vi.fn().mockResolvedValue([
          { id: "e1", description: "Hotel", category: "lodging", amount: 200 },
          { id: "e2", description: "Unknown", category: "unexpected", amount: null },
        ]),
      });

      await expect(service.getPlanBudget("plan-1")).resolves.toEqual({
        budget: 0,
        entries: [
          { id: "e1", description: "Hotel", category: "lodging", amount: 200 },
          { id: "e2", description: "Unknown", category: "transport", amount: 0 },
        ],
      });
    });
  });

  describe("updatePlanBudget", () => {
    it("rejects a negative budget without touching the repository", async () => {
      const updatePlanBudget = vi.fn();
      const service = makeService({ updatePlanBudget });

      await expect(service.updatePlanBudget("plan-1", -1)).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
      expect(updatePlanBudget).not.toHaveBeenCalled();
    });

    it("returns the persisted budget from the affected row", async () => {
      const service = makeService({
        updatePlanBudget: vi.fn().mockResolvedValue({ budget: 1500 }),
      });

      await expect(service.updatePlanBudget("plan-1", 1500)).resolves.toBe(1500);
    });
  });

  describe("entry mutations", () => {
    it("creates an entry and returns the new id", async () => {
      const service = makeService({
        createBudgetEntry: vi.fn().mockResolvedValue({ id: "entry-9" }),
      });

      await expect(
        service.createBudgetEntry("plan-1", { description: "Taxi", category: "transport", amount: 20 })
      ).resolves.toBe("entry-9");
    });

    it("updates an entry with its persisted fields", async () => {
      const updateBudgetEntry = vi.fn().mockResolvedValue({ id: "entry-1" });
      const service = makeService({ updateBudgetEntry });

      await service.updateBudgetEntry({
        id: "entry-1",
        description: "Hotel",
        category: "lodging",
        amount: 200,
      });

      expect(updateBudgetEntry).toHaveBeenCalledWith("entry-1", {
        description: "Hotel",
        category: "lodging",
        amount: 200,
      });
    });

    it("deletes an entry by id", async () => {
      const deleteBudgetEntry = vi.fn().mockResolvedValue({ id: "entry-1" });
      const service = makeService({ deleteBudgetEntry });

      await service.deleteBudgetEntry("entry-1");

      expect(deleteBudgetEntry).toHaveBeenCalledWith("entry-1");
    });
  });
});
