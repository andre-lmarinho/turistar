import 'server-only';

import { notFound } from 'next/navigation';

import { createSupabaseServerClient } from '@/shared/lib/supabaseServer';
import {
  mapPlanDaysFromSupabase,
  type SupabasePlanDayRow,
} from '@/features/app/planner/services/supabase/planDaysMapper';
import type { DayPlan } from '@/features/app/planner/domain/types/PlannerEntities';
import type { Entry } from '@/features/app/planner/types/budget';

export interface UserPlannerExperience {
  planId: string;
  title?: string;
  destination: string;
  initialDays?: DayPlan[];
  initialBudget?: number;
  initialEntries?: Entry[];
  editToken: string;
}

export async function getUserPlannerExperience(
  planId: string,
  userId: string
): Promise<UserPlannerExperience> {
  const supabase = createSupabaseServerClient();
  const { data, error } = (await supabase
    .from('plans')
    .select('id, title, plan_destinations(destinations(name)), edit_token, budget, user_id')
    .eq('id', planId)
    .maybeSingle()) as unknown as {
    data: {
      id: string;
      title: string | null;
      edit_token: string;
      budget: number | null;
      user_id: string | null;
      plan_destinations: { destinations: { name: string | null } }[] | null;
    } | null;
    error: unknown;
  };

  if (error) {
    throw error;
  }

  if (!data || data.user_id !== userId) {
    notFound();
  }

  const destination = data.plan_destinations?.[0]?.destinations?.name ?? undefined;

  if (!destination) {
    notFound();
  }

  const { data: dayRows, error: dayErr } = (await supabase
    .from('plan_days')
    .select('date, activities(*)')
    .eq('plan_id', planId)
    .order('position')) as unknown as {
    data: SupabasePlanDayRow[] | null;
    error: unknown;
  };

  if (dayErr) {
    throw dayErr;
  }

  const initialDays = dayRows ? mapPlanDaysFromSupabase(dayRows) : undefined;

  const { data: entryRows, error: entryErr } = (await supabase
    .from('budget_entries')
    .select('id, description, category, amount')
    .eq('plan_id', planId)) as unknown as {
    data:
      | {
          id: string;
          description: string | null;
          category: string | null;
          amount: number | null;
        }[]
      | null;
    error: unknown;
  };

  if (entryErr) {
    throw entryErr;
  }

  const initialEntries = entryRows?.map((entry) => ({
    id: entry.id,
    description: entry.description ?? '',
    category: (entry.category as Entry['category']) ?? 'transport',
    amount: entry.amount ?? 0,
  }));

  return {
    planId,
    title: data.title ?? undefined,
    destination,
    initialDays,
    initialBudget: data.budget ?? undefined,
    initialEntries,
    editToken: data.edit_token,
  };
}
