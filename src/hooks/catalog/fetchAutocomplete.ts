// src/hooks/fetchAutocomplete.ts

import type { AutocompletePlace } from '@/types';
import { fetchJson } from '@/lib';

/**
 * Fetches autocomplete suggestions via the local API route.
 * Throws if the request fails.
 */
export async function fetchAutocomplete(text: string): Promise<AutocompletePlace[]> {
  const data = await fetchJson<{ results: AutocompletePlace[] }>(
    '/api/autocomplete',
    { text },
    'Failed to fetch suggestions'
  );
  return data.results;
}
