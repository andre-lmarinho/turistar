// src/hooks/useDestinationCatalog.ts

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '@/hooks';
import type { CatalogActivity } from '@/types';

/**
 * Loads catalog activities for a destination and derives available categories.
 */
export function useDestinationCatalog(enabled: boolean, city: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog', city],
    queryFn: () => fetchCatalog(city),
    enabled,
  });

  const activities: CatalogActivity[] = useMemo(() => data?.activities ?? [], [data?.activities]);
  const categories = useMemo(
    () => Array.from(new Set(activities.map((a) => a.category))).sort(),
    [activities]
  );

  return {
    activities,
    categories,
    loading: isLoading,
    error: isError ? 'Failed to load catalog.' : null,
  };
}
