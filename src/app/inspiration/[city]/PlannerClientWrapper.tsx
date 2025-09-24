'use client';

import dynamic from 'next/dynamic';
import type { PlannerClientProps } from '@/app/planner/PlannerClient';

const PlannerClient = dynamic(() => import('@/app/planner/PlannerClient'), {
  ssr: false,
});

export default function PlannerClientWrapper(props: PlannerClientProps) {
  return <PlannerClient {...props} />;
}
