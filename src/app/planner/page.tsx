// src/app/planner/page.tsx
'use client';

import { Suspense } from 'react';
import PlannerClient from './PlannerClient';
import { LoadingScreen } from '@/components';

export const dynamic = 'force-dynamic';

export default function PlannerPage() {
  return (
    <Suspense fallback={<LoadingScreen text="Loading planner…" />}>
      <PlannerClient />
    </Suspense>
  );
}
