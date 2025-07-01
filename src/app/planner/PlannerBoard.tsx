// src/app/planner/PlannerBoard.tsx
"use client";

import {
  DndContext,
  DragOverlay,
  type SensorDescriptor,
  type SensorOptions,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";

import DayColumn from "@/components/dnd/DayColumn";
import { SortableItem } from "@/components/dnd/SortableItem";
import ActivityCard from "@/components/planner/ActivityCard";
import type { DayPlan, Activity } from "@/types/itinerary";

export interface PlannerBoardProps {
  /** May be undefined on the very first render, normalize below */
  days?: DayPlan[];
  /** ID of the dragged card, or null if none */
  activeId: string | null;
  /** Sensors configured in the hook */
  sensors: SensorDescriptor<SensorOptions>[];
  /** Collision detection strategy from the hook */
  collisionDetection: CollisionDetection;
  /** Called when dragging starts */
  handleDragStart(e: DragStartEvent): void;
  /** Called continuously during drag to reorder in real time */
  handleDragOver(e: DragOverEvent): void;
}

export default function PlannerBoard(props: PlannerBoardProps) {
  // ───────────────────────────────────────────────────────────────
  // 1) Normalize `days` immediately so it's never undefined below
  // ───────────────────────────────────────────────────────────────
  const days = props.days ?? [];

  // ───────────────────────────────────────────────────────────────
  // 2) Destructure the remaining props after the guard
  // ───────────────────────────────────────────────────────────────
  const {
    activeId,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
  } = props;

  // ───────────────────────────────────────────────────────────────
  // 3) Compute the currently active activity for the DragOverlay
  // ───────────────────────────────────────────────────────────────
  const activeActivity: Activity | undefined = days
    .flatMap((d) => d.activities)
    .find((a) => a.id === activeId);

  // ───────────────────────────────────────────────────────────────
  // 4) Render the DnD context, columns, and floating overlay
  // ───────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
    >
      {/* Horizontal scroll of day columns */}
      <div className="p-4 flex gap-4 overflow-x-auto h-full min-h-64 rounded-md border">
        {days.map((day, index) => (
          <div key={day.id} className="flex items-stretch">
            <DayColumn day={day} />
            {index !== days.length - 1 && (
              <div className="w-px bg-gray-300 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Floating preview of the dragged card */}
      <DragOverlay>
        {activeActivity && (
          <SortableItem id={activeActivity.id} dragOverlay>
            <ActivityCard activity={activeActivity} />
          </SortableItem>
        )}
      </DragOverlay>
    </DndContext>
  );
}
