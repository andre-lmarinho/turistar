// src/hooks/useCatalogActivities.ts

import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '@/hooks';
import type { CatalogActivity } from '@/types';

/**
 * Hook to load catalog activities for a destination.
 * Provides raw activity data along with React Query state.
 */
export function useCatalogActivities(
  dest: string | null,
  categories: string[],
  options: { enabled: boolean },
) {
  const query = useQuery({
    queryKey: ['catalog', dest, categories],
    queryFn: () => fetchCatalog(dest || '', categories),
    enabled: options.enabled && !!dest,
  });

  const activities: CatalogActivity[] | undefined = query.data?.activities;

  return { activities, ...query };
}
