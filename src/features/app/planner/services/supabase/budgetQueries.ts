import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { BudgetEntryInsertPayload } from "@/features/app/planner/server/repositories/BudgetRepository";
import {
  createBudgetEntry as createBudgetEntryRepository,
  deleteBudgetEntry as deleteBudgetEntryRepository,
  fetchPlanBudgetEntries,
  fetchPlanBudgetRow,
  updateBudgetEntry as updateBudgetEntryRepository,
  updatePlanBudget as updatePlanBudgetRepository,
} from "@/features/app/planner/server/repositories/BudgetRepository";
import type { Entry } from "@/features/app/planner/types/budget";

type PlannerSupabaseClient = SupabaseClient;

type BudgetEntryRow = {
  id: string;
  description: string | null;
  category: string | null;
  amount: number | null;
};

type BudgetEntryInput = Pick<Entry, "description" | "category" | "amount">;

function mapBudgetEntry(row: BudgetEntryRow): Entry {
  return {
    id: row.id,
    description: row.description ?? "",
    category: (row.category as Entry["category"]) ?? "transport",
    amount: row.amount ?? 0,
  };
}

export async function fetchPlanBudget(
  planId: string,
  client?: PlannerSupabaseClient
): Promise<{ budget: number; entries: Entry[] }> {
  const [budgetRow, entryRows] = await Promise.all([
    fetchPlanBudgetRow(planId, { client }),
    fetchPlanBudgetEntries(planId, { client }),
  ]);

  return {
    budget: budgetRow?.budget ?? 0,
    entries: entryRows.map(mapBudgetEntry),
  };
}

export async function updatePlanBudget(
  planId: string,
  newBudget: number,
  client?: PlannerSupabaseClient
): Promise<number> {
  const data = await updatePlanBudgetRepository(planId, newBudget, { client });
  return data?.budget ?? newBudget;
}

export async function createBudgetEntry(
  planId: string,
  payload: BudgetEntryInput,
  client?: PlannerSupabaseClient
): Promise<string> {
  const { id } = await createBudgetEntryRepository(planId, payload, { client });
  return id;
}

export async function updateBudgetEntry(entry: Entry, client?: PlannerSupabaseClient): Promise<void> {
  const payload: BudgetEntryInsertPayload = {
    description: entry.description,
    category: entry.category,
    amount: entry.amount,
  };
  await updateBudgetEntryRepository(entry.id, payload, { client });
}

export async function deleteBudgetEntry(entryId: string, client?: PlannerSupabaseClient): Promise<void> {
  await deleteBudgetEntryRepository(entryId, { client });
}
