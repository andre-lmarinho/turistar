/**
 * Geoapify API response types
 */
export type GeoapifyFeatureProperties = {
  place_id: string | number;
  name?: string;
  formatted?: string;
  lat: number;
  lon: number;
  categories?: string[];
  distance?: number;
  image?: string;
  description?: string;
  address_line1?: string;
  address_line2?: string;
  street?: string;
  postcode?: string;
  district?: string;
  city?: string;
  county?: string;
  state?: string;
  state_code?: string;
  country?: string;
  country_code?: string;
  timezone?: {
    name?: string;
    offset_STD?: string;
    offset_DST?: string;
  };
  result_type?: string;
  category?: string;
  wiki_and_media?: {
    wikidata?: string;
  };
};

export type GeoapifyFeature = {
  properties: GeoapifyFeatureProperties;
};

export type GeoapifyResponse = { features: GeoapifyFeature[] } | { results: GeoapifyFeatureProperties[] };

export interface GeoapifyPlaceSearchResult {
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

export interface GeoapifyPlaceDetails {
  placeId: string;
  name: string;
  formatted: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  district?: string;
  city?: string;
  county?: string;
  state?: string;
  stateCode?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: {
    name?: string;
    offsetSTD?: string;
    offsetDST?: string;
  };
  wikidataId?: string;
  description?: string;
  categories: string[];
  resultType?: string;
}

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
  source?: "location" | "activity";
}
