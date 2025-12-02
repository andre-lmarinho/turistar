'use client';

import { createLocationAutocompleteHook } from '@/features/app/planner/hooks/search/createLocationAutocompleteHook';

/**
 * Planner-specific Geoapify autocomplete that narrows results to street-level addresses.
 */
export const useAddressAutocomplete = createLocationAutocompleteHook({
  endpoint: '/api/places/address',
  queryKeyPrefix: 'planner-address-autocomplete',
  minimumQueryLength: 4,
});
