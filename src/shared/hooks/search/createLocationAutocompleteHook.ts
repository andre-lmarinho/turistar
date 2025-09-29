// src/shared/hooks/search/createLocationAutocompleteHook.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { AutocompletePlace } from '@/shared/types/locations';

export interface LocationAutocompleteOptions {
  enabled?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface LocationAutocompleteConfig {
  /** Endpoint that proxies Geoapify autocomplete results. */
  endpoint: string;
  /** Prefix used for the TanStack Query cache key. */
  queryKeyPrefix: string;
  /** Minimum length before the query triggers. Defaults to 4 characters. */
  minimumQueryLength?: number;
}

export type LocationAutocompleteHook = (
  query: string,
  options?: LocationAutocompleteOptions
) => { results: AutocompletePlace[]; loading: boolean; error: boolean };

export function createLocationAutocompleteHook({
  endpoint,
  queryKeyPrefix,
  minimumQueryLength = 4,
}: LocationAutocompleteConfig): LocationAutocompleteHook {
  return function useLocationAutocomplete(
    query: string,
    options: LocationAutocompleteOptions = {}
  ) {
    const trimmedQuery = query.trim();
    const isEnabled = (options.enabled ?? true) && trimmedQuery.length >= minimumQueryLength;

    const { data, isLoading, isError } = useQuery({
      queryKey: [queryKeyPrefix, trimmedQuery, options.latitude, options.longitude],
      queryFn: async () => {
        const params = new URLSearchParams({ text: trimmedQuery });
        if (options.latitude != null && options.longitude != null) {
          params.set('lat', String(options.latitude));
          params.set('lon', String(options.longitude));
        }
        const res = await fetch(`${endpoint}?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to load suggestions');
        }
        const body = (await res.json()) as { results: AutocompletePlace[] };
        return body.results;
      },
      enabled: isEnabled,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    });

    return {
      results: data ?? ([] as AutocompletePlace[]),
      loading: isLoading,
      error: isError,
    };
  };
}
