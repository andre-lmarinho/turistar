import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Entry } from '@/features/app/planner/types/budget';
import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';

import { formatSupabaseError } from './supabaseErrors';

type PlannerSupabaseClient = SupabaseClient;

type BudgetPlanRow = { budget: number | null };
type BudgetEntryRow = {
  id: string;
  description: string | null;
  category: string | null;
  amount: number | null;
};

type BudgetEntryInput = Pick<Entry, 'description' | 'category' | 'amount'>;

function mapBudgetEntry(row: BudgetEntryRow): Entry {
  return {
    id: row.id,
    description: row.description ?? '',
    category: (row.category as Entry['category']) ?? 'transport',
    amount: row.amount ?? 0,
  };
}

export async function fetchPlanBudget(
  planId: string,
  client?: PlannerSupabaseClient
): Promise<{ budget: number; entries: Entry[] }> {
  const supabase = client ?? createSupabaseServerClient();
  const budgetRes = (await supabase
    .from('plans')
    .select('budget')
    .eq('id', planId)
    .single()) as { data: BudgetPlanRow | null; error: unknown };
  const entryRes = (await supabase
    .from('budget_entries')
    .select('id, description, category, amount')
    .eq('plan_id', planId)) as { data: BudgetEntryRow[] | null; error: unknown };

  if (budgetRes.error) {
    throw formatSupabaseError({
      operation: 'fetchPlanBudget:plan',
      identifiers: { planId },
      error: budgetRes.error,
    });
  }
  if (entryRes.error) {
    throw formatSupabaseError({
      operation: 'fetchPlanBudget:entries',
      identifiers: { planId },
      error: entryRes.error,
    });
  }

  return {
    budget: budgetRes.data?.budget ?? 0,
    entries: (entryRes.data ?? []).map(mapBudgetEntry),
  };
}

export async function updatePlanBudget(
  planId: string,
  newBudget: number,
  client?: PlannerSupabaseClient
): Promise<number> {
  const supabase = client ?? createSupabaseServerClient();
  const { data, error } = (await supabase
    .from('plans')
    .update({ budget: newBudget })
    .eq('id', planId)
    .select('budget')
    .single()) as { data: BudgetPlanRow | null; error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'updatePlanBudget',
      identifiers: { planId },
      error,
    });
  }
  return data?.budget ?? newBudget;
}

export async function createBudgetEntry(
  planId: string,
  payload: BudgetEntryInput,
  client?: PlannerSupabaseClient
): Promise<string> {
  const supabase = client ?? createSupabaseServerClient();
  const res = (await supabase
    .from('budget_entries')
    .insert({
      plan_id: planId,
      description: payload.description,
      category: payload.category,
      amount: payload.amount,
    })
    .select('id')
    .single()) as { data: { id: string } | null; error: unknown };

  if (res.error) {
    throw formatSupabaseError({
      operation: 'createBudgetEntry',
      identifiers: { planId },
      error: res.error,
    });
  }
  if (!res.data) {
    throw formatSupabaseError({
      operation: 'createBudgetEntry:missing-row',
      identifiers: { planId },
    });
  }
  return res.data.id;
}

export async function updateBudgetEntry(
  entry: Entry,
  client?: PlannerSupabaseClient
): Promise<void> {
  const supabase = client ?? createSupabaseServerClient();
  const { error } = (await supabase
    .from('budget_entries')
    .update({
      description: entry.description,
      category: entry.category,
      amount: entry.amount,
    })
    .eq('id', entry.id)) as { error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'updateBudgetEntry',
      identifiers: { entryId: entry.id },
      error,
    });
  }
}

export async function deleteBudgetEntry(
  entryId: string,
  client?: PlannerSupabaseClient
): Promise<void> {
  const supabase = client ?? createSupabaseServerClient();
  const { error } = (await supabase
    .from('budget_entries')
    // @ts-expect-error Supabase typings omit delete, but runtime supports it
    .delete()
    .eq('id', entryId)) as { error: unknown };

  if (error) {
    throw formatSupabaseError({
      operation: 'deleteBudgetEntry',
      identifiers: { entryId },
      error,
    });
  }
}
