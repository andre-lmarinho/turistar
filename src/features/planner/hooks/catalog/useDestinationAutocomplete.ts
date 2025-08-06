// src/hooks/useDestinationAutocomplete.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAutocomplete } from '@/features/planner';
import type { AutocompletePlace } from '@/shared/types';

/**
 * Provides Geoapify autocomplete suggestions when query length is >= 4.
 * Results are cached for one minute and won't refetch on window focus.
 */
export function useDestinationAutocomplete(query: string, options: { enabled?: boolean } = {}) {
  const isEnabled = (options.enabled ?? true) && query.length >= 4;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => fetchAutocomplete(query),
    enabled: isEnabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  return {
    results: data ?? ([] as AutocompletePlace[]),
    loading: isLoading,
    error: isError,
  };
}
