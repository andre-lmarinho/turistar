// src/hooks/fetchAutocomplete.ts

import type { AutocompletePlace } from '@/types';

/**
 * Fetches autocomplete suggestions via the local API route.
 * Throws if the request fails.
 */
export async function fetchAutocomplete(text: string): Promise<AutocompletePlace[]> {
  const params = new URLSearchParams({ text });
  const res = await fetch(`/api/autocomplete?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch suggestions: HTTP ${res.status}`);
  }
  const data: { results: AutocompletePlace[] } = await res.json();
  return data.results;
}
