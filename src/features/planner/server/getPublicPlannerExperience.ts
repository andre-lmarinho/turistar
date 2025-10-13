import { notFound } from 'next/navigation';
import { supabaseServer } from '@/shared/lib/supabaseServer';

import {
  mapPlanDaysFromSupabase,
  type SupabasePlanDayRow,
} from '../services/supabase/planDaysMapper';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

export interface PlannerExperiencePayload {
  planId: string;
  title?: string;
  destination: string;
  initialDays?: DayPlan[];
}

interface GetPublicPlannerExperienceArgs {
  slug: string;
  dest?: string;
}

export async function getPublicPlannerExperience({
  slug,
  dest,
}: GetPublicPlannerExperienceArgs): Promise<PlannerExperiencePayload> {
  const supabase = supabaseServer();

  const { data: planRow, error: planErr } = (await supabase
    .from('plans')
    .select('id, title, plan_destinations(destinations(name))')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()) as unknown as {
    data: {
      id: string;
      title: string | null;
      plan_destinations: { destinations: { name: string } }[] | null;
    } | null;
    error: unknown;
  };

  if (planErr || !planRow) {
    notFound();
  }

  const planId = planRow.id;
  const title = planRow.title ?? undefined;
  const destination = dest ?? planRow.plan_destinations?.[0]?.destinations?.name ?? undefined;

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

  const initialDays = !dayErr && dayRows ? mapPlanDaysFromSupabase(dayRows) : undefined;

  return {
    planId,
    title,
    destination,
    initialDays,
  };
}
