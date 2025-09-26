// src/features/planner/index.tsx

import nextDynamic from 'next/dynamic';

import LoadingScreen from '@/shared/components/LoadingScreen';

import type { PlannerClientProps } from './ui/screens/PlannerClient';
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

export const PlannerExperience = nextDynamic<PlannerClientProps>(
  () => import('./ui/screens/PlannerClient'),
  {
    ssr: false,
    loading: () => <LoadingScreen text="Loading planner…" />,
  },
);

export default PlannerExperience;

export type { PlannerClientProps };
export { getPublicPlannerExperience };
export type { PlannerExperiencePayload } from './server/getPublicPlannerExperience';
export { default as PlannerClient } from './ui/screens/PlannerClient';
