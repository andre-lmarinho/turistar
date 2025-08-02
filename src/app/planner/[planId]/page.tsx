// src/app/planner/[planId]/page.tsx
export const dynamic = 'force-dynamic';

import PlannerClient from '../PlannerClient';

type PageProps = {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ dest?: string }>;
};

export default async function PlannerPlanPage({
  params,
  searchParams,
}: PageProps) {
  const { planId } = await params;
  const { dest } = await searchParams;
  return <PlannerClient planId={planId} dest={dest} />;
}
