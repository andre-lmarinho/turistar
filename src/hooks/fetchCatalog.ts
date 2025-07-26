// src/hooks/fetchCatalog.ts

import type { CatalogActivity } from '@/types';

export interface CatalogApiResponse {
  activities: CatalogActivity[];
}

/**
 * Fetches the catalog activities for a destination.
 * Throws if the request fails.
 */
export async function fetchCatalog(dest: string): Promise<CatalogApiResponse> {
  const res = await fetch(`/api/catalog?dest=${encodeURIComponent(dest)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: HTTP ${res.status}`);
  }
  return res.json();
}
