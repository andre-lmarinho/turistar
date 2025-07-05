// src/types/itinerary.ts

/** A single activity/item in the itinerary. */
export interface Activity {
  id: string;
  title: string;
  color: string;
  description?: string;
  duration?: number;
  startTime?: string;
  imageUrl?: string;
}

/** Catalog item (as fetched from the API) */
export interface CatalogActivity {
  id: string;
  name: string;
  description: string;
  duration: number;
  image_url: string;
  price: string;
  category: string;
}

/** Plan for a single day: a flat list of activities. */
export interface DayPlan {
  /** ISO date string (YYYY-MM-DD) */
  id: string;
  /** Human‐readable label (e.g. "Mon 05") */
  label: string;
  /** Activities for that day (max ~8) */
  activities: Activity[];
}
