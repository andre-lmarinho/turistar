// src/features/planner/hooks/search/useAddressAutocomplete.ts
'use client';

import { createLocationAutocompleteHook } from '@/shared/hooks/search/createLocationAutocompleteHook';

/**
 * Planner-specific Geoapify autocomplete that narrows results to street-level addresses.
 */
export const useAddressAutocomplete = createLocationAutocompleteHook({
  endpoint: '/api/autocomplete/addresses',
  queryKeyPrefix: 'planner-address-autocomplete',
  minimumQueryLength: 4,
});
