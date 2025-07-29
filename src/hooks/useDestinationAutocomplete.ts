// src/hooks/useDestinationAutocomplete.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAutocomplete } from '@/hooks';
import type { AutocompletePlace } from '@/types';

/**
 * Provides Geoapify autocomplete suggestions when query length is >= 3.
 */
export function useDestinationAutocomplete(query: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => fetchAutocomplete(query),
    enabled: query.length >= 3,
  });

  return {
    results: data ?? ([] as AutocompletePlace[]),
    loading: isLoading,
    error: isError,
  };
}
