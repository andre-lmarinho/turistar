import { notFound } from 'next/navigation';
import { supabaseServer } from '@/shared/lib/supabaseServer';

import {
  mapPlanDaysFromSupabase,
  type SupabasePlanDayRow,
} from '../services/supabase/planDaysMapper';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import type { Entry } from '@/features/planner/types/budget';

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
    .select('id, title, plan_destinations(destinations(name)), user_id, edit_token, budget')
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
  const destination = dest ?? planRow.plan_destinations?.[0]?.destinations?.name ?? undefined;

  if (!destination) {
    notFound();
  }

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

  const initialDays = !dayErr && dayRows ? mapPlanDaysFromSupabase(dayRows) : undefined;

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
