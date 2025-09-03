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
  const latStr = params.get('lat');
  const lngStr = params.get('lng');
  const lat = latStr != null ? Number(latStr) : undefined;
  const lng = lngStr != null ? Number(lngStr) : undefined;
  const destCoords =
    lat != null &&
    lng != null &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
      ? { lat, lng }
      : null;
  return { dest, destCoords };
}
