import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatSupabaseError } from "@/shared/lib/supabaseErrors";
import { createSupabaseServerClient } from "@/shared/lib/supabaseServer";
import type { Database } from "@/shared/types/supabase";

import type { CategoryKey, Entry } from "../types";

type BudgetRepositoryOptions = {
  client?: SupabaseClient;
};

type BudgetPlanRow = {
  budget: Database["public"]["Tables"]["plans"]["Row"]["budget"];
};

type BudgetEntryRow = Pick<
  Database["public"]["Tables"]["budget_entries"]["Row"],
  "id" | "description" | "category" | "amount"
>;

type BudgetEntryInsertPayload = Pick<
  Database["public"]["Tables"]["budget_entries"]["Insert"],
  "description" | "category" | "amount"
>;

const CATEGORY_KEYS: CategoryKey[] = ["transport", "lodging", "food", "activities", "shopping", "documents"];

function isCategoryKey(value: string): value is CategoryKey {
  return CATEGORY_KEYS.includes(value as CategoryKey);
}

function getClient(client?: SupabaseClient): SupabaseClient {
  return client ?? createSupabaseServerClient();
}

export async function fetchPlanBudgetRow(
  planId: string,
  { client }: BudgetRepositoryOptions = {}
): Promise<BudgetPlanRow | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plans")
    .select("budget")
    .eq("id", planId)
    .single()) as unknown as { data: BudgetPlanRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchPlanBudgetRow",
      identifiers: { planId },
      error,
    });
  }

  return data ?? null;
}

export async function fetchPlanBudgetEntries(
  planId: string,
  { client }: BudgetRepositoryOptions = {}
): Promise<BudgetEntryRow[]> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("budget_entries")
    .select("id, description, category, amount")
    .eq("plan_id", planId)) as unknown as { data: BudgetEntryRow[] | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "fetchPlanBudgetEntries",
      identifiers: { planId },
      error,
    });
  }

  return data ?? [];
}

export async function updatePlanBudget(
  planId: string,
  newBudget: number,
  { client }: BudgetRepositoryOptions = {}
): Promise<BudgetPlanRow | null> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("plans")
    .update({ budget: newBudget })
    .eq("id", planId)
    .select("budget")
    .single()) as unknown as { data: BudgetPlanRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "updatePlanBudget",
      identifiers: { planId },
      error,
    });
  }

  return data ?? null;
}

export async function createBudgetEntry(
  planId: string,
  payload: BudgetEntryInsertPayload,
  { client }: BudgetRepositoryOptions = {}
): Promise<{ id: string }> {
  const supabase = getClient(client);
  const { data, error } = (await supabase
    .from("budget_entries")
    .insert({
      plan_id: planId,
      description: payload.description,
      category: payload.category,
      amount: payload.amount,
    })
    .select("id")
    .single()) as unknown as { data: { id: string } | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "createBudgetEntry",
      identifiers: { planId },
      error,
    });
  }

  if (!data) {
    throw formatSupabaseError({
      operation: "createBudgetEntry:missing-row",
      identifiers: { planId },
    });
  }

  return data;
}

export async function updateBudgetEntry(
  entryId: string,
  payload: BudgetEntryInsertPayload,
  { client }: BudgetRepositoryOptions = {}
): Promise<void> {
  const supabase = getClient(client);
  const { error } = (await supabase
    .from("budget_entries")
    .update({
      description: payload.description,
      category: payload.category,
      amount: payload.amount,
    })
    .eq("id", entryId)) as unknown as { error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: "updateBudgetEntry",
      identifiers: { entryId },
      error,
    });
  }
}

export async function deleteBudgetEntry(
  entryId: string,
  { client }: BudgetRepositoryOptions = {}
): Promise<void> {
  const supabase = getClient(client);
  const { error } = (await supabase.from("budget_entries").delete().eq("id", entryId)) as unknown as {
    error: unknown;
  };

  if (error) {
    throw formatSupabaseError({
      operation: "deleteBudgetEntry",
      identifiers: { entryId },
      error,
    });
  }
}

export function mapEntries(rows: BudgetEntryRow[]): Entry[] {
  return rows.map((row) => {
    const rawCategory = row.category ?? "";
    const category = isCategoryKey(rawCategory) ? rawCategory : "transport";
    return {
      id: row.id,
      description: row.description ?? "",
      category,
      amount: row.amount ?? 0,
    };
  });
}
