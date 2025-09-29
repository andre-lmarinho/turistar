// src/shared/types/locations.ts

/**
 * Autocomplete location returned by Geoapify.
 */
export interface AutocompletePlace {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Result item returned by Geoapify place search.
 */
export interface SearchActivity {
  id: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  metadata?: Record<string, unknown>;
}
