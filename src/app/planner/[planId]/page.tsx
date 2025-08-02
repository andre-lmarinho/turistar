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
  if (!destination) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('plans')
      .select('destination, title')
      .eq('id', planId)
      .single();
    if (!error)
      destination =
        (data as { destination?: string; title?: string } | null)?.destination ?? data?.title;
  }

  if (!destination) {
    return <p className="p-4">Plan destination not found.</p>;
  }

  return <PlannerClient planId={planId} dest={destination} />;
}
