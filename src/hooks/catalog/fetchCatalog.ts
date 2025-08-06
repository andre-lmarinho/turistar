// src/hooks/fetchCatalog.ts

import type { CatalogActivity } from '@/types';
import { fetchJson } from '@/lib';

export interface CatalogApiResponse {
  activities: CatalogActivity[];
}

/**
 * Fetches the catalog activities for a destination.
 * Throws if the request fails.
 */
export async function fetchCatalog(dest: string): Promise<CatalogApiResponse> {
  return fetchJson<CatalogApiResponse>('/api/catalog', { dest }, 'Failed to fetch catalog');
}
