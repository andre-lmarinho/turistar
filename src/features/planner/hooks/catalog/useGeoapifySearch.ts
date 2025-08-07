// src/features/planner/hooks/catalog/useGeoapifySearch.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSearch } from './fetchSearch';
import type { CatalogActivity } from '@/shared/types';

/**
 * Runs a Geoapify place search when the query has 4+ characters.
 */
export function useGeoapifySearch(query: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['geoapify-search', query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 4,
  });

  return {
    results: data ?? ([] as CatalogActivity[]),
    loading: isLoading,
    error: isError,
  };
}
