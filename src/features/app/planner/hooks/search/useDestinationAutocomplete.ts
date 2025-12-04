'use client';

import { GEOAPIFY_MIN_QUERY_LENGTH } from '@/shared/lib/geoapify/constants';
import { createGeoapifySuggestionHook } from '@/features/app/planner/hooks/search/createGeoapifySuggestionHook';
import type { AutocompletePlace } from '@/features/app/planner/types/locations';

/**
 * Geoapify autocomplete tailored to city/state/country lookups (used in creation flows).
 */
export const useDestinationAutocomplete = createGeoapifySuggestionHook<AutocompletePlace>({
  endpoint: '/api/places/city-country',
  queryKeyPrefix: 'home-destination-autocomplete',
  minimumQueryLength: GEOAPIFY_MIN_QUERY_LENGTH,
  paramName: 'text',
});
