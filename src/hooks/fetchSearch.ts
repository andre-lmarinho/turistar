// src/hooks/fetchSearch.ts
import type { CatalogActivity } from '@/types';

/**
 * Fetches catalog search results via the local API.
 */
export async function fetchSearch(query: string): Promise<CatalogActivity[]> {
  const params = new URLSearchParams({ q: query });
  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to search: HTTP ${res.status}`);
  }
  const data: { activities: CatalogActivity[] } = await res.json();
  return data.activities;
}
