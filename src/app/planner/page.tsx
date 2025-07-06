// src/app/planner/page.tsx
'use client';

import { Suspense } from 'react';
import PlannerWrapper from './PlannerWrapper';

export const dynamic = 'force-dynamic';

export default function PlannerPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading planner…</p>}>
      <PlannerWrapper />
    </Suspense>
  );
}
