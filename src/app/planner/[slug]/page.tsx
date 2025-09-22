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
  params: { slug: string };
  searchParams: { dest?: string };
};

type NextPlannerPageProps = globalThis.PageProps<'/planner/[slug]'>;

const resolvePlannerParams = (params: NextPlannerPageProps['params']): PageProps['params'] => {
  if (!params) {
    throw new Error('Missing planner route params');
  }

  // Next.js still types app router params as Promises; cast to the resolved shape.
  return params as unknown as PageProps['params'];
};

const resolvePlannerSearchParams = (
  searchParams: NextPlannerPageProps['searchParams']
): PageProps['searchParams'] => {
  if (!searchParams) {
    return {};
  }

  const resolved = searchParams as unknown as Record<string, string | string[] | undefined>;
  const rawDest = resolved.dest;

  return {
    dest: Array.isArray(rawDest) ? rawDest[0] : rawDest,
  };
};

export default async function PlannerPlanPage(props: NextPlannerPageProps) {
  const { slug } = resolvePlannerParams(props.params);
  const { dest } = resolvePlannerSearchParams(props.searchParams);

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
