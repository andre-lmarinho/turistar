"use client";

import { createGeoapifySuggestionHook } from "@/features/app/planner/hooks/search/createGeoapifySuggestionHook";
import type { AutocompletePlace } from "@/features/app/planner/types/locations";
import { GEOAPIFY_MIN_QUERY_LENGTH } from "@/shared/lib/geoapify/config";

/**
 * Planner-specific Geoapify autocomplete that narrows results to street-level addresses.
 */
export const useAddressAutocomplete = createGeoapifySuggestionHook<AutocompletePlace>({
  endpoint: "/api/places/address",
  queryKeyPrefix: "planner-address-autocomplete",
  minimumQueryLength: GEOAPIFY_MIN_QUERY_LENGTH,
  paramName: "text",
});
