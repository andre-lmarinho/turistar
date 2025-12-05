/**
 * Normalized selection payload shared by autocomplete inputs.
 */
export interface PlaceSelection<T = unknown> extends AutocompletePlace {
  id?: string;
  placeId?: string;
  formatted?: string;
  description?: string;
  category?: string;
  raw?: T;
  source?: 'location' | 'activity';
}

/** Autocomplete location returned by Geoapify. */
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

export interface ActivitySuggestion {
  placeId: string;
  name: string;
  formatted: string;
  addressLine1?: string;
  addressLine2?: string;
  latitude: number;
  longitude: number;
  resultType?: string;
  category?: string;
  description?: string;
}
