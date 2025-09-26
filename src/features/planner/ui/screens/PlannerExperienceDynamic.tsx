// src/features/planner/ui/screens/PlannerExperienceDynamic.tsx

'use client';

import nextDynamic from 'next/dynamic';

import LoadingScreen from '@/shared/components/LoadingScreen';

import type { PlannerClientProps } from './PlannerClient';

const PlannerExperience = nextDynamic<PlannerClientProps>(() => import('./PlannerClient'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading planner…" />,
});

export default PlannerExperience;
