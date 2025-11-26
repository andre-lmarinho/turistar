'use client';

import { createLocationAutocompleteHook } from '@/features/app/planner/hooks/search/createLocationAutocompleteHook';

/**
 * Geoapify autocomplete tailored to city/state/country lookups for the marketing home page.
 */
export const useDestinationAutocomplete = createLocationAutocompleteHook({
  endpoint: '/api/autocomplete',
  queryKeyPrefix: 'home-destination-autocomplete',
  minimumQueryLength: 4,
});
