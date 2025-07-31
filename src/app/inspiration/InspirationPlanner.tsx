// src/app/inspiration/InspirationPlanner.tsx
import dynamic from 'next/dynamic';

import type { DayPlan } from '@/types';

interface Props {
  initialDays: DayPlan[];
  dest: string;
  planId: string;
}

const PlannerClient = dynamic(() => import('@/app/planner/PlannerClient'), {
  ssr: false,
});

export default function InspirationPlanner({ initialDays, dest, planId }: Props) {
  return (
    <PlannerClient
      initialDays={initialDays}
      dest={dest}
      planId={planId}
      hideOnboarding
      hideCatalog
    />
  );
}
