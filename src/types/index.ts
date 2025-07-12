// src/types/index.ts

import type {
  SensorDescriptor,
  SensorOptions,
  CollisionDetection,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';

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

/**
 * Props for the drag-and-drop planner board component.
 */
export interface PlannerBoardProps {
  /** Columns of day plans to render */
  days: DayPlan[];
  /** ID of the currently dragged card */
  activeId: string | null;
  /** Sensors configuration for DnD-kit */
  sensors: SensorDescriptor<SensorOptions>[];
  /** Collision detection strategy for DnD-kit */
  collisionDetection: CollisionDetection;
  /** Handler invoked when dragging starts */
  handleDragStart(e: DragStartEvent): void;
  /** Handler invoked on drag-over events */
  handleDragOver(e: DragOverEvent): void;
  /** Handler invoked when dragging ends */
  handleDragEnd(e: DragEndEvent): void;
  /** Callback when a card is selected */
  onSelectActivity(activity: Activity): void;
  /** Callback to add a new blank activity at given position */
  onAddActivity(dayId: string, index?: number): void;
  /** Callback to update an activity's title inline */
  onUpdateTitle(id: string, title: string): void;
}
