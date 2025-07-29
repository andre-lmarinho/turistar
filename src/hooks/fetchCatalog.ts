// src/hooks/fetchCatalog.ts

import type { CatalogActivity } from '@/types';

export interface CatalogApiResponse {
  activities: CatalogActivity[];
}

/**
 * Fetches the catalog activities for a destination.
 * Throws if the request fails.
 */
export async function fetchCatalog(
  dest: string,
  categories: string[]
): Promise<CatalogApiResponse> {
  const params = new URLSearchParams({ dest });
  if (categories.length > 0) params.set('cats', categories.join(','));
  const res = await fetch(`/api/catalog?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: HTTP ${res.status}`);
  }
  return res.json();
}
