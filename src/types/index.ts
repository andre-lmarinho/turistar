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
  /** Optional budget for the activity */
  budget?: number;
  /** Category of the activity, e.g. "museum" */
  category?: string;
}

/**
 * Catalog item as fetched from the API.
 */
export interface CatalogActivity {
  id: string;
  name: string;
  description: string;
  duration: number;
  image_url: string;
  price: string;
  category: string;
  rating?: number;
  reviewcount?: number;
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
