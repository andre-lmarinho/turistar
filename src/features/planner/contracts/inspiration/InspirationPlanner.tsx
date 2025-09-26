// src/features/planner/contracts/inspiration/InspirationPlanner.tsx
'use client';

import { PlannerClient } from '@/features/planner';
import type { PlannerClientProps } from '@/features/planner';

export type PlannerExperienceProps = PlannerClientProps;

export function InspirationPlanner(props: PlannerExperienceProps) {
  return <PlannerClient {...props} />;
}
