// src/types/itinerary.ts

/** A single activity/item in the itinerary. */
export interface Activity {
  id: string;
  title: string;
  duration: number;
  description: string;
  color?: string; // Tailwind class ou hex (“bg-red-500”, “#ff0000”)
  startTime?: string; // “HH:MM” – horário planejado
  poiName?: string; // nome do POI original (para header do modal)
  imageUrl?: string;
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
