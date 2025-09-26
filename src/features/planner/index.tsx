// src/features/planner/index.tsx

import PlannerExperienceComponent from './ui/screens/PlannerExperienceDynamic';
import {
  getPublicPlannerExperience,
  type PlannerExperiencePayload,
} from './server/getPublicPlannerExperience';

export const dynamic = 'force-dynamic';

export async function getPlannerExperience(props: {
  slug: string;
  dest?: string;
}): Promise<PlannerExperiencePayload> {
  return getPublicPlannerExperience(props);
}

export function PlannerPage() {
  return <PlannerExperienceComponent />;
}

export default PlannerPage;

export { default as PlannerExperience } from './ui/screens/PlannerExperienceDynamic';
export type { PlannerClientProps } from './ui/screens/PlannerClient';
export { getPublicPlannerExperience };
export type { PlannerExperiencePayload } from './server/getPublicPlannerExperience';
export { default as PlannerClient } from './ui/screens/PlannerClient';
export { createPlannerPlan } from './server/createPlan';
export type {
  CreatePlannerPlanInput,
  CreatePlannerPlanResult,
  PlannerDestination,
  PlannerRecentPlanPayload,
} from './server/createPlan';
