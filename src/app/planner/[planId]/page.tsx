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
    let response = await supabase.from('plans').select('dest').eq('id', planId).single();

    const missingDestColumn =
      typeof response.error === 'object' &&
      response.error !== null &&
      'message' in response.error &&
      typeof (response.error as { message: string }).message === 'string' &&
      (response.error as { message: string }).message.includes('column "dest"');

    if (missingDestColumn) {
      response = await supabase.from('plans').select('destination').eq('id', planId).single();
      if (!response.error)
        destination =
          (response.data as { destination: string | null } | null)?.destination ?? undefined;
    } else if (!response.error) {
      destination = (response.data as { dest: string | null } | null)?.dest ?? undefined;
    }
  }

  if (!destination) {
    return <p className="p-4">Plan destination not found.</p>;
  }

  return <PlannerClient planId={planId} dest={destination} />;
}
