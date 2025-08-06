// src/app/planner/[planId]/page.tsx
export const dynamic = 'force-dynamic';

import PlannerClient from '../PlannerClient';
import { supabaseServer } from '@/shared/lib/supabaseServer';
import type { DayPlan } from '@/shared/types';
import { format, parseISO } from 'date-fns';
import { DEFAULT_COLORS, DEFAULT_NEW_CARD_COLOR_INDEX } from '@/shared/constants';

type PageProps = {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dest?: string }>;
};

export default async function PlannerPlanPage({ params, searchParams }: PageProps) {
  const { planId } = await params;
  const { dest } = await searchParams;

  let destination = dest;
  let title: string | undefined;
  let initialDays: DayPlan[] | undefined;

  const supabase = await supabaseServer();
  if (!destination) {
    const { data, error } = (await supabase
      .from('plans')
      .select('title, plan_destinations(destinations(name))')
      .eq('id', planId)
      .single()) as unknown as {
      data: {
        title: string | null;
        plan_destinations: { destinations: { name: string } }[] | null;
      } | null;
      error: unknown;
    };

    if (!error && data) {
      title = data.title ?? undefined;
      destination = data.plan_destinations?.[0]?.destinations?.name ?? undefined;
    }
  }

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
      dest={destination}
      title={title ?? destination}
    />
  );
}
