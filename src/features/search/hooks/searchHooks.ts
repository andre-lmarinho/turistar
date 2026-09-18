"use client";

import type { ActivitySuggestion, AutocompletePlace } from "../types";
import { createGeoapifySuggestionHook } from "./createGeoapifySuggestionHook";

export const useAddressAutocomplete = createGeoapifySuggestionHook<AutocompletePlace>({
  endpoint: "/api/places/address",
  queryKeyPrefix: "planner-address-autocomplete",
  paramName: "text",
});

export const useDestinationAutocomplete = createGeoapifySuggestionHook<AutocompletePlace>({
  endpoint: "/api/places/city-country",
  queryKeyPrefix: "home-destination-autocomplete",
  paramName: "text",
});

export const useActivitySuggestions = createGeoapifySuggestionHook<ActivitySuggestion>({
  endpoint: "/api/places/search",
  queryKeyPrefix: "planner-activity-suggestions",
  paramName: "name",
});
