/**
 * Search suggestion and selection types
 */
export interface AutocompletePlace {
  name: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  formatted?: string;
  description?: string;
  category?: string;
  country?: string;
  countryCode?: string;
}

export type PlaceSearch = "city-country" | "address" | "search";
export const MIN_SEARCH_LENGTH = 3;
