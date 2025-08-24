// src/features/planner/hooks/search/useDestinationAutocomplete.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { AutocompletePlace } from '@/shared/types';

async function fetchAutocomplete(
  text: string,
  lat?: number,
  lon?: number
): Promise<AutocompletePlace[]> {
  const params = new URLSearchParams({ text });
  if (lat != null && lon != null) {
    params.set('lat', String(lat));
    params.set('lon', String(lon));
  }
  const res = await fetch(`/api/autocomplete?${params.toString()}`);
  if (!res.ok) {
    let message = 'Failed to load suggestions.';
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      // ignore JSON parsing errors
    }
    throw new Error(message);
  }
  const data = (await res.json()) as { results: AutocompletePlace[] };
  return data.results;
}

/**
 * Provides Geoapify autocomplete suggestions when query length is >= 4.
 * Results are cached for one minute and won't refetch on window focus.
 */
export function useDestinationAutocomplete(
  query: string,
  options: { enabled?: boolean; latitude?: number; longitude?: number } = {}
) {
  const isEnabled = (options.enabled ?? true) && query.length >= 4;

  const { data, isLoading, error } = useQuery<AutocompletePlace[], Error>({
    queryKey: ['autocomplete', query, options.latitude, options.longitude],
    queryFn: () => fetchAutocomplete(query, options.latitude, options.longitude),
    enabled: isEnabled,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  return {
    results: data ?? ([] as AutocompletePlace[]),
    loading: isLoading,
    error: error ? error.message : null,
  };
}
