import { notFound } from 'next/navigation';
import { supabaseServer } from '@/shared/lib/supabaseServer';

import {
  mapPlanDaysFromSupabase,
  type SupabasePlanDayRow,
} from '../services/supabase/planDaysMapper';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { Entry } from '@/features/planner/types/budget';
import { buildInitialDays } from '@/features/planner/services/days/initialDays';
import { eachDayOfInterval } from 'date-fns';

export interface PlannerExperiencePayload {
  planId: string;
  title?: string;
  destination: string;
  initialDays?: DayPlan[];
  initialBudget?: number;
  initialEntries?: Entry[];
  canEdit: boolean;
  editToken?: string;
}

interface GetPublicPlannerExperienceArgs {
  slug: string;
  dest?: string;
  viewerUserId?: string;
  editToken?: string;
}

export async function getPublicPlannerExperience({
  slug,
  dest,
  viewerUserId,
  editToken,
}: GetPublicPlannerExperienceArgs): Promise<PlannerExperiencePayload> {
  const supabase = supabaseServer();

  const { data: planRow, error: planErr } = (await supabase
    .from('plans')
    .select(
      'id, title, plan_destinations(destinations(name)), user_id, edit_token, budget, start_date, end_date'
    )
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()) as unknown as {
    data: {
      id: string;
      title: string | null;
      user_id: string | null;
      edit_token: string;
      budget: number | null;
      plan_destinations: { destinations: { name: string } }[] | null;
      start_date: string | null;
      end_date: string | null;
    } | null;
    error: unknown;
  };

  if (planErr || !planRow) {
    notFound();
  }

  const planId = planRow.id;
  const planOwnerId = planRow.user_id;
  const planEditToken = planRow.edit_token;
  const initialBudget = planRow.budget ?? undefined;
  const title = planRow.title ?? undefined;
  const destination =
    dest ?? planRow.plan_destinations?.[0]?.destinations?.name ?? 'Destination TBD';

  const isOwner = viewerUserId && planOwnerId && viewerUserId === planOwnerId;
  const tokenMatches = editToken && editToken === planEditToken;
  const canEdit = Boolean(isOwner || tokenMatches);
  const grantedToken = canEdit ? planEditToken : undefined;

  const { data: dayRows, error: dayErr } = (await supabase
    .from('plan_days')
    .select('date, activities(*)')
    .eq('plan_id', planId)
    .order('position')) as unknown as {
    data: SupabasePlanDayRow[] | null;
    error: unknown;
  };

  let initialDays = !dayErr && dayRows ? mapPlanDaysFromSupabase(dayRows) : undefined;

  if (!initialDays || initialDays.length === 0) {
    const startDate = planRow.start_date ? new Date(planRow.start_date) : null;
    const endDate = planRow.end_date ? new Date(planRow.end_date) : null;

    if (
      startDate &&
      endDate &&
      !Number.isNaN(startDate.valueOf()) &&
      !Number.isNaN(endDate.valueOf())
    ) {
      const tripDays = eachDayOfInterval({ start: startDate, end: endDate });
      initialDays = buildInitialDays(tripDays);
    }
  }

  const { data: entryRows } = (await supabase
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
  };

  const initialEntries = entryRows?.map((entry) => ({
    id: entry.id,
    description: entry.description ?? '',
    category: (entry.category as Entry['category']) ?? 'transport',
    amount: entry.amount ?? 0,
  }));

  return {
    planId,
    title,
    destination,
    initialDays,
    initialBudget,
    initialEntries,
    canEdit,
    editToken: grantedToken,
  };
}
