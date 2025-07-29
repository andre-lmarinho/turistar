// src/hooks/useDestinationCatalog.ts

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '@/hooks';

/**
 * Hook to fetch and manage the catalog activities.
 * - Loads catalog activities by destination from the API with React Query.
 * - Loads results after the user selects categories.
 * - Handles loading and error states.
 */

export function useDestinationCatalog(enabled: boolean, categories: string[], city: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['catalog', city, categories],
    queryFn: () => fetchCatalog(city, categories),
    enabled: enabled && categories.length > 0,
  });
  const loading = isLoading;
  const error = isError ? 'Failed to load catalog.' : null;
  const [search, setSearch] = useState('');

  /**
   * Filters activities by search term.
   */
  const visibleItems = useMemo(() => {
    const activities = data?.activities ?? [];
    const searchLower = search.toLowerCase();
    return activities.filter((it) => it.name.toLowerCase().includes(searchLower));
  }, [data?.activities, search]);

  return {
    visibleItems,
    loading,
    error,
    search,
    setSearch,
  };
}
