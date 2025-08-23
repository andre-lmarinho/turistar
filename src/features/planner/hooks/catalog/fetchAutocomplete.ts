// src/features/planner/hooks/catalog/fetchAutocomplete.ts

import type { AutocompletePlace } from '@/shared/types';
import { fetchJson } from '@/shared/lib';

/**
 * Fetches autocomplete suggestions via the local API route.
 * Throws if the request fails.
 */
export async function fetchAutocomplete(
  text: string,
  lat?: number,
  lon?: number
): Promise<AutocompletePlace[]> {
  const params: Record<string, string> = { text };
  if (lat != null && lon != null) {
    params.lat = String(lat);
    params.lon = String(lon);
  }
  const data = await fetchJson<{ results: AutocompletePlace[] }>(
    '/api/autocomplete',
    params,
    'Failed to fetch suggestions'
  );
  return data.results;
}
