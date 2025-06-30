// src/types/itinerary.ts

/** A single activity/item in the itinerary. */
export interface Activity {
  id: string;
  title: string;
  duration: number;
  description: string;
  // you can keep other fields (e.g. `type`) if you still use them elsewhere
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
