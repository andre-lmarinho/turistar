// src/features/planner/hooks/search/fetchSearch.ts
import type { SearchActivity } from '@/features/planner/domain/types/PlannerEntities';
import { fetchJson } from '@/shared/lib/http';

/**
 * Fetches place search results via the local API.
 */
export async function fetchSearch(query: string): Promise<SearchActivity[]> {
  const data = await fetchJson<{ activities: SearchActivity[] }>(
    '/api/search',
    { q: query },
    'Failed to search'
  );
  return data.activities;
}
