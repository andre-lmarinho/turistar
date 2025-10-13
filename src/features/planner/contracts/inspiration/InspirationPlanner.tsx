'use client';

import { PlannerClient } from '@/features/planner/components/PlannerClient';
import type { PlannerClientProps } from '@/features/planner/components/PlannerClient';

export type PlannerExperienceProps = PlannerClientProps;

export function InspirationPlanner(props: PlannerExperienceProps) {
  return <PlannerClient {...props} />;
}
