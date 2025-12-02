'use client';

import { createLocationAutocompleteHook } from '@/features/app/planner/hooks/search/createLocationAutocompleteHook';

/**
 * Geoapify autocomplete tailored to city/state/country lookups (used in creation flows).
 */
export const useDestinationAutocomplete = createLocationAutocompleteHook({
  endpoint: '/api/places/city-country',
  queryKeyPrefix: 'home-destination-autocomplete',
  minimumQueryLength: 4,
});
