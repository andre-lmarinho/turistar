// src/features/planner/contracts/inspiration/InspirationPlanner.tsx
'use client';

import PlannerClient from '@/features/planner/ui/screens/PlannerClient';
import type { PlannerClientProps } from '@/features/planner/ui/screens/PlannerClient';

export type PlannerExperienceProps = PlannerClientProps;

export function InspirationPlanner(props: PlannerExperienceProps) {
  return <PlannerClient {...props} />;
}
