// src/app/planner/page.tsx
'use client';

import { Suspense } from 'react';
import PlannerClient from './PlannerClient';

export const dynamic = 'force-dynamic';

export default function PlannerPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading planner…</p>}>
      <PlannerClient />
    </Suspense>
  );
}
