// src/types/index.ts

export * from './budget';

/**
 * A single activity/item in the catalog.
 */
export interface Activity {
  id: string;
  title: string;
  color: string;
  description?: string;
  duration?: number;
  startTime?: string;
  imageUrl?: string;
  budget?: number;
  category?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Catalog item as fetched from the API.
 */
export interface CatalogActivity {
  id: string;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
}

/**
 * Autocomplete location returned by Geoapify.
 */
export interface AutocompletePlace {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Data structure representing a single day's plan.
 */
export interface DayPlan {
  /** ISO date string (YYYY-MM-DD) */
  id: string;
  /** Human-readable label, e.g. "Mon, 05 Jul" */
  label: string;
  /** List of activities for this day */
  activities: Activity[];
}
