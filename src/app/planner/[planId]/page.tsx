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
    const supabase = await supabaseServer();
    const { data, error } = (await supabase
      .from('plans')
      .select('dest')
      .eq('id', planId)
      .single()) as unknown as {
      data: { dest: string | null } | null;
      error: unknown;
    };
    if (!error) destination = data?.dest ?? undefined;
  }

  if (!destination) {
    return <p className="p-4">Plan destination not found.</p>;
  }

  return <PlannerClient planId={planId} dest={destination} />;
}
