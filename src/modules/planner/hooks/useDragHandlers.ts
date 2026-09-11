"use client";

import type { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import { PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useCallback, useRef, useState } from "react";
import type { DayPlan } from "@/features/activity/types";
import { applyEvent } from "@/features/events/lib/eventReducer";
import type { ActivityDestination } from "@/features/events/lib/planOperations";
import { moveActivityOperation } from "@/features/events/lib/planOperations";
import { buildIndexMaps, getDragTarget } from "../lib/dragUtils";

interface UseDragHandlersOptions {
  onActivityMove?: (activityId: string, destination: ActivityDestination) => void;
}

export function useDragHandlers(days: DayPlan[], { onActivityMove }: UseDragHandlersOptions = {}) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [destination, setDestination] = useState<ActivityDestination | null>(null);
  const destinationRef = useRef(destination);
  const previewDays =
    activeId && destination
      ? moveActivityOperation(days, String(activeId), destination).reduce(applyEvent, days)
      : days;
  const previewRef = useRef(previewDays);
  previewRef.current = previewDays;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 4 } })
  );
  const resolveDestination = useCallback((event: DragOverEvent | DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) return destinationRef.current;
    const current = previewRef.current;
    const { dayMap, activityMap } = buildIndexMaps(current);
    const target = getDragTarget(current, event.over, dayMap, activityMap);
    if (!target) return destinationRef.current;
    const day = current[target.dayIndex];
    const remaining = day.activities.filter((activity) => activity.id !== String(event.active.id));
    return { toDayId: day.id, beforeActivityId: remaining[target.activityIndex]?.id };
  }, []);
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    destinationRef.current = null;
    setDestination(null);
  }, []);
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      destinationRef.current = resolveDestination(event);
      setDestination(destinationRef.current);
    },
    [resolveDestination]
  );
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setDestination(null);
    destinationRef.current = null;
  }, []);
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const target = resolveDestination(event);
      if (target) onActivityMove?.(String(event.active.id), target);
      handleDragCancel();
    },
    [resolveDestination, onActivityMove, handleDragCancel]
  );
  return { previewDays, activeId, sensors, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel };
}
