// src/app/planner/PlannerBoard.tsx
"use client";

import {
  DndContext,
  DragOverlay,
  type SensorDescriptor,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import DayColumn from "@/components/dnd/DayColumn";
import { SortableItem } from "@/components/dnd/SortableItem";
import type { DayPlan, Activity } from "@/types/itinerary";

export interface PlannerBoardProps {
  days: DayPlan[];
  activeId: string | null;
  /** Array of configured DnD sensors */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: SensorDescriptor<any>[];
  /** Collision detection strategy */
  collisionDetection: CollisionDetection;
  handleDragStart(e: DragStartEvent): void;
  handleDragOver(e: DragOverEvent): void;
}

export default function PlannerBoard({
  days,
  activeId,
  sensors,
  collisionDetection,
  handleDragStart,
  handleDragOver,
}: PlannerBoardProps) {
  const activeActivity: Activity | undefined = days
    .flatMap((d) => d.activities)
    .find((a) => a.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 overflow-x-auto">
        {days.map((day) => (
          <DayColumn key={day.id} day={day} />
        ))}
      </div>

      <DragOverlay>
        {activeActivity && (
          <SortableItem id={activeActivity.id} dragOverlay>
            <h3 className="font-medium">{activeActivity.title}</h3>
            <p className="text-sm text-muted-foreground">
              {activeActivity.description}
            </p>
            <span className="text-xs">≈ {activeActivity.duration} min</span>
          </SortableItem>
        )}
      </DragOverlay>
    </DndContext>
  );
}
