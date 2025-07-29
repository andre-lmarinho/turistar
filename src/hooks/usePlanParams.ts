// src/hooks/usePlanParams.ts
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Reads plan parameters from the URL and ensures a plan id exists.
 * - Returns the normalized destination and plan id.
 * - Updates the URL with a generated plan id if missing.
 */
export function usePlanParams() {
  const params = useSearchParams();
  const router = useRouter();

  const paramsString = params.toString();
  const dest = params.get('dest')?.trim().toLowerCase() ?? '';
  const lat = params.get('lat');
  const lng = params.get('lng');
  const destCoords = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  const [planId] = useState(() => params.get('plan') ?? crypto.randomUUID());

  useEffect(() => {
    const currentSearch = new URLSearchParams(paramsString);
    const currentPlan = currentSearch.get('plan');
    if (currentPlan !== planId) {
      const newSearch = new URLSearchParams(paramsString);
      newSearch.set('plan', planId);
      router.replace(`/planner?${newSearch.toString()}`, { scroll: false });
    }
  }, [planId, paramsString, router]);

  return { dest, planId, destCoords };
}
