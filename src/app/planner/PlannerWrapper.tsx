// src/app/planner/PlannerWrapper.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import PlannerClient from '@/app/planner/PlannerClient';

export default function PlannerWrapper() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('dest') || 'Itinerary';
  const router = useRouter();
  const viewParam = searchParams.get('view');
  const orientation = viewParam === 'vertical' ? 'vertical' : 'horizontal';

  function handleToggle() {
    const newOrientation = orientation === 'vertical' ? 'horizontal' : 'vertical';
    const search = new URLSearchParams(searchParams.toString());
    if (newOrientation === 'horizontal') {
      search.delete('view');
    } else {
      search.set('view', 'vertical');
    }
    router.replace(`/planner?${search.toString()}`, { scroll: false });
  }

  return (
    <main className="flex flex-col px-4 md:px-12 py-4 bg-card min-h-screen">
      <h2 className="text-5xl font-semibold mb-4 capitalize">{destination}</h2>
      <PlannerClient orientation={orientation} onToggleView={handleToggle} />
    </main>
  );
}
