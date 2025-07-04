// src/app/planner/page.tsx
'use client';

import { Suspense } from 'react';
import PlannerClient from '@/app/planner/PlannerClient';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function PlannerPage() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('dest') || 'Itinerary';
  return (
    <Suspense fallback={<p className="p-4">Loading planner…</p>}>
      <main className="px-4 md:px-12 py-4 bg-card min-h-screen">
        <h2 className="text-5xl font-semibold mb-4 capitalize">{destination}</h2>
        {/* only render the client wrapper here */}
        <PlannerClient />
      </main>
    </Suspense>
  );
}
