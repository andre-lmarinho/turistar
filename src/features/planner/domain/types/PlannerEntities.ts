// src/features/planner/domain/types/PlannerEntities.ts

/**
 * A single activity within a plan.
 */
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
  /** Relative ordering position used for conflict-free reordering */
  position?: string;
}
