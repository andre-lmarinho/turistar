// src/app/planner/[slug]/page.tsx
export const dynamic = 'force-dynamic';

import PlannerClient from '../PlannerClient';
import {
  mapPlanDaysFromSupabase,
  type SupabasePlanDayRow,
} from '@/features/planner/services/supabase/planDaysMapper';
import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { DayPlan } from '@/shared/types';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ dest?: string }>;
};

export default async function PlannerPlanPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { dest } = await searchParams;

  let destination = dest;
  let title: string | undefined;
  let initialDays: DayPlan[] | undefined;

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
    return <p className="p-4">Plan not found.</p>;
  }

  const planId = planRow.id;
  title = planRow.title ?? undefined;
  destination = destination ?? planRow.plan_destinations?.[0]?.destinations?.name ?? undefined;

  const { data: dayRows, error: dayErr } = (await supabase
    .from('plan_days')
    .select('date, activities(*)')
    .eq('plan_id', planId)
    .order('position')) as unknown as {
    data: SupabasePlanDayRow[] | null;
    error: unknown;
  };

  if (!dayErr && dayRows) {
    initialDays = mapPlanDaysFromSupabase(dayRows);
  }

  if (!destination) {
    return <p className="p-4">Plan destination not found.</p>;
  }

  return (
    <PlannerClient
      initialDays={initialDays}
      planId={planId}
      slug={slug}
      dest={destination}
      title={title ?? destination}
    />
  );
}
