// src/app/planner/[slug]/page.tsx
export const dynamic = 'force-dynamic';

import PlannerClient from '../PlannerClient';
import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { DayPlan } from '@/shared/types';
import { format, parseISO } from 'date-fns';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/shared/constants';

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
    data: {
      date: string;
      activities: {
        id: string;
        title: string;
        color: string | null;
        category: string;
        description: string | null;
        start_time: string | null;
        duration: number | null;
        latitude: number | null;
        longitude: number | null;
        budget: number | null;
        image_url: string | null;
      }[];
    }[];
    error: unknown;
  };

  if (!dayErr && dayRows) {
    initialDays = dayRows.map((d) => ({
      id: d.date,
      label: format(parseISO(d.date), 'EEE, dd MMM'),
      activities: d.activities.map((a) => ({
        id: a.id,
        title: a.title,
        color: a.color ?? DEFAULT_COLORS[DEFAULT_NEW_CARD_COLOR_INDEX].bg,
        category: a.category,
        description: a.description ?? undefined,
        startTime: a.start_time ?? undefined,
        duration: a.duration ?? undefined,
        latitude: a.latitude ?? undefined,
        longitude: a.longitude ?? undefined,
        budget: a.budget ?? undefined,
        imageUrl: a.image_url ?? undefined,
      })),
    })) as DayPlan[];
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
