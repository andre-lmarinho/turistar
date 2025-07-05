// src/hooks/useActivityCatalog.ts

import { useQuery } from '@tanstack/react-query';
import type { CatalogActivity } from '@/types/itinerary';

/**
 * Hook to fetch catalog activities from local JSON files.
 * - Used to load the available activities in the catalog by destination.
 * - The returned data is in the CatalogActivity format.
 */
export function useActivityCatalog(dest: string) {
  return useQuery<CatalogActivity[]>({
    queryKey: ['catalog', dest],
    queryFn: async () => {
      // Simple local fetch for now
      const res = await fetch(`/data/${dest}.json`);
      if (!res.ok) throw new Error('Catalog not found');
      return res.json();
    },
  });
}
