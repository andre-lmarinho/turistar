/**
 * Core activity types for the travel planner.
 */

/** Activity color configuration */
export interface ActivityColor {
  bg: string;
  border: string;
  name: string;
}

/** A single activity within a day plan */
export interface Activity {
  id: string;
  title: string;
  color: string;
  position?: string;
  description?: string;
  address?: string;
  duration?: number;
  startTime?: string;
  imageUrl?: string;
  budget?: number;
  category?: string;
  latitude?: number;
  longitude?: number;
  _optimistic?: boolean;
}

/** A day containing activities */
export interface DayPlan {
  /** ISO date string (YYYY-MM-DD) */
  id: string;
  /** Human-readable label, e.g. "Mon, 05 Jul" */
  label: string;
  /** Activities for this day */
  activities: Activity[];
  /** Ordering position for conflict-free sync */
  position?: string;
}
