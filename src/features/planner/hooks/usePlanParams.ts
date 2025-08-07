// src/features/planner/hooks/usePlanParams.ts
'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Reads planner parameters from the URL.
 * - Returns the normalized destination and optional coordinates.
 */
export function usePlanParams() {
  const params = useSearchParams();
  const dest = params.get('dest')?.trim().toLowerCase() ?? '';
  const lat = params.get('lat');
  const lng = params.get('lng');
  const destCoords = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  return { dest, destCoords };
}
