// src/hooks/fetchSearch.ts
import type { CatalogActivity } from '@/shared/types';
import { fetchJson } from '@/shared/lib';

/**
 * Fetches catalog search results via the local API.
 */
export async function fetchSearch(query: string): Promise<CatalogActivity[]> {
  const data = await fetchJson<{ activities: CatalogActivity[] }>(
    '/api/search',
    { q: query },
    'Failed to search'
  );
  return data.activities;
}
