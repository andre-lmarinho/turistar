// src/app/inspiration/rome/InspirationPlanner.tsx
'use client';

import PlannerClient from '@/app/planner/PlannerClient';
import type { DayPlan } from '@/types';

interface Props {
  initialDays: DayPlan[];
  dest: string;
  planId: string;
}

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
