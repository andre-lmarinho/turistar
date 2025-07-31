// src/app/planner/page.tsx
'use client';

import dynamic from 'next/dynamic';

import { LoadingScreen } from '@/components';

export const dynamic = 'force-dynamic';

const PlannerClient = dynamic(() => import('./PlannerClient'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading planner…" />,
});

export default function PlannerPage() {
  return <PlannerClient />;
}
