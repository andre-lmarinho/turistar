// src/app/planner/[planId]/page.tsx
export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';
import { LoadingScreen } from '@/components';

type PageProps = {
  params: { planId: string };
  searchParams: { dest?: string };
};

const PlannerClient = nextDynamic(() => import('../PlannerClient'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading planner…" />,
});

export default function PlannerPlanPage({ params, searchParams }: PageProps) {
  return <PlannerClient planId={params.planId} dest={searchParams.dest} />;
}
