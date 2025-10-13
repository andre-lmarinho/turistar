'use client';

import { PlannerClient } from '@/features/planner/components/PlannerClient';
import type { PlannerClientProps } from '@/features/planner/components/PlannerClient';

export function InspirationPlanner(props: PlannerClientProps) {
  return <PlannerClient {...props} />;
}
