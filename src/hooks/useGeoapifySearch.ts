// src/hooks/useGeoapifySearch.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSearch } from '@/hooks/fetchSearch';
import type { CatalogActivity } from '@/types';

/**
 * Runs a Geoapify place search when the query has 3+ characters.
 */
export function useGeoapifySearch(query: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['geoapify-search', query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 3,
  });

  return {
    results: data ?? ([] as CatalogActivity[]),
    loading: isLoading,
    error: isError,
  };
}
