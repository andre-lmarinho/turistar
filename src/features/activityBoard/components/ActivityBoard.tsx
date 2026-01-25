"use client";

import type { CollisionDetection } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getActivity } from "@/features/activity/lib/activityOperations";

import { useDragHandlers } from "../hooks/useDragHandlers";
import type { BoardProps } from "../types";
import { DayColumn } from "./DayColumn";
import { DraggableCard } from "./DraggableCard";

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    const containerId = pointerCollisions[0].id;
    const centerCollisions = closestCenter(args);

    // Find sortables that belong to the same container we're hovering over
    const sortablesInContainer = centerCollisions.filter((collision) => {
      const sortable = collision.data?.droppableContainer?.data?.current?.sortable;
      return sortable?.containerId === containerId;
    });

    // Return sortables in this container if found, otherwise return the container itself
    return sortablesInContainer.length > 0 ? sortablesInContainer : pointerCollisions;
  }
  return closestCenter(args);
};

export const ActivityBoard = memo(function Board({
  days,
  canEdit = true,
  onActivitySelect,
  onDaysChange,
  onAddActivity,
  onFallbackAdd,
}: BoardProps) {
  const [draftDays, setDraftDays] = useState(days);
  const handleDaysCommit = useCallback(
    (nextDays: BoardProps["days"]) => {
      onDaysChange?.(nextDays);
    },
    [onDaysChange]
  );
  const { activeId, sensors, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
    useDragHandlers(draftDays, { onDaysChange: setDraftDays, onDaysCommit: handleDaysCommit });
  const boardRef = useRef<HTMLUListElement>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
    };
  }, []);

  // Sync draftDays with props when not dragging
  useEffect(() => {
    if (!activeId) setDraftDays(days);
  }, [activeId, days]);

  // Get active activity for drag overlay
  const activeActivity = useMemo(() => {
    if (!activeId) return null;
    return getActivity(draftDays, String(activeId));
  }, [activeId, draftDays]);

  const isInteractiveElement = (el: EventTarget | null): boolean =>
    el instanceof Element &&
    el.closest(
      'button, a, input, textarea, select, [role="button"], [draggable="true"], [data-no-drag-scroll]'
    ) !== null;

  // Drag scroll on non-interactive areas
  const handleMouseDown = (e: React.MouseEvent<HTMLUListElement>) => {
    if (activeId) return;
    if (isInteractiveElement(e.target)) return;

    const startX = e.clientX;
    const scrollLeft = boardRef.current?.scrollLeft || 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (boardRef.current) {
        boardRef.current.scrollLeft = scrollLeft + (startX - e.clientX);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      dragCleanupRef.current = null;
    };

    dragCleanupRef.current = handleMouseUp;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <DndContext
      id="activity-board"
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}>
      <ul
        ref={boardRef}
        aria-label="Days"
        onMouseDown={handleMouseDown}
        className="bg-background m-0 flex h-full flex-1 list-none gap-4 overflow-x-auto overflow-y-hidden rounded-xl border p-4 select-none cursor-default">
        {draftDays.map((day) => (
          <li key={day.id} className="w-58 shrink-0">
            <DayColumn
              day={day}
              canEdit={canEdit}
              onActivitySelect={(activity, dayId) => onActivitySelect?.(activity, dayId)}
              onAddActivity={onAddActivity}
              onFallbackAdd={onFallbackAdd}
            />
          </li>
        ))}
      </ul>

      {canEdit && (
        <DragOverlay>
          {activeActivity && (
            <DraggableCard id={activeActivity.id} activity={activeActivity} dragOverlay aria-grabbed="true" />
          )}
        </DragOverlay>
      )}
    </DndContext>
  );
});
