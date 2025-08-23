// src/app/inspiration/InspirationPlanner.tsx
'use client';

import dynamic from 'next/dynamic';
import type { DayPlan } from '@/shared/types';
import type { Entry } from '@/features/budget';

interface Props {
  initialDays: DayPlan[];
  dest: string;
  planId: string;
  initialBudget?: number;
  initialEntries?: Entry[];
}

const PlannerClient = dynamic(() => import('@/app/planner/PlannerClient'), {
  ssr: false,
});

export default function InspirationPlanner({
  initialDays,
  dest,
  planId,
  initialBudget,
  initialEntries,
}: Props) {
  return (
    <PlannerClient
      initialDays={initialDays}
      dest={dest}
      planId={planId}
      initialBudget={initialBudget}
      initialEntries={initialEntries}
      hideOnboarding
      hideCatalog
      persist={false}
    />
  );
}
