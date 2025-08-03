// src/app/planner/[planId]/page.tsx
export const dynamic = 'force-dynamic';

import PlannerClient from '../PlannerClient';
import { supabaseServer } from '@/lib/supabaseServer';

type PageProps = {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dest?: string }>;
};

export default async function PlannerPlanPage({ params, searchParams }: PageProps) {
  const { planId } = await params;
  const { dest } = await searchParams;

  let destination = dest;
  let title: string | undefined;

  if (!destination) {
    const supabase = await supabaseServer();
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

  if (!destination) {
    return <p className="p-4">Plan destination not found.</p>;
  }

  return <PlannerClient planId={planId} dest={destination} title={title ?? destination} />;
}
