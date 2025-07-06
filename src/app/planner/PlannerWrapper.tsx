'use client';

import { useSearchParams } from 'next/navigation';
import PlannerClient from '@/app/planner/PlannerClient';

export default function PlannerWrapper() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('dest') || 'Itinerary';

  return (
    <main className="flex flex-col px-4 md:px-12 py-4 bg-card min-h-screen">
      <h2 className="text-5xl font-semibold mb-4 capitalize">{destination}</h2>
      <PlannerClient />
    </main>
  );
}
