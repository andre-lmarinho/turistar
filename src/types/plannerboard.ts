// src/types/plannerboard.ts
import type {
  SensorDescriptor,
  SensorOptions,
  CollisionDetection,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import type { DayPlan, Activity } from './itinerary';

export interface PlannerBoardProps {
  days: DayPlan[];
  activeId: string | null;
  sensors: SensorDescriptor<SensorOptions>[];
  collisionDetection: CollisionDetection;
  handleDragStart(e: DragStartEvent): void;
  handleDragOver(e: DragOverEvent): void;
  onSelectActivity(activity: Activity): void;
  onAddNew(dayId: string, index?: number): void;
  onUpdateTitle(id: string, title: string): void;
}
