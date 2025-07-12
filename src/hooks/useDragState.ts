// src/hooks/useDragState.ts
'use client';

import { useState, useRef } from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import type { DayPlan, Activity } from '@/types';

export function useDragState(initialDays: DayPlan[]) {
  const [days, setDays] = useState<DayPlan[]>(initialDays);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeItem, setActiveItem] = useState<Activity | null>(null);

  const lastOverRef = useRef<{ containerId: string; index: number } | null>(null);
  const lastTimeRef = useRef<number>(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(e: DragStartEvent): void {
    setActiveId(e.active.id);
    const found = days.flatMap((d) => d.activities).find((a) => a.id === e.active.id) ?? null;
    setActiveItem(found);
    lastOverRef.current = null;
    lastTimeRef.current = 0;
  }

  function handleDragOver(e: DragOverEvent): void {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const now = Date.now();
    if (now - lastTimeRef.current < 50) return;
    lastTimeRef.current = now;

    setDays((prevDays) => {
      const updated = prevDays.map((d) => ({ ...d, activities: [...d.activities] }));

      const srcDayIdx = updated.findIndex((d) => d.activities.some((a) => a.id === active.id));
      if (srcDayIdx < 0) return prevDays;
      const srcActs = updated[srcDayIdx].activities;
      const oldIndex = srcActs.findIndex((a) => a.id === active.id);

      const toSortable = over.data.current?.sortable;

      let dstDayIdx: number;
      let newIndex: number;

      if (toSortable) {
        dstDayIdx = updated.findIndex((d) => d.id === String(toSortable.containerId));
        newIndex = toSortable.index;
      } else {
        dstDayIdx = updated.findIndex((d) => d.id === over.id);
        if (dstDayIdx < 0) return prevDays;
        newIndex = updated[dstDayIdx].activities.length;
      }

      if (dstDayIdx === srcDayIdx && newIndex === oldIndex) {
        return prevDays;
      }

      const dstActs = dstDayIdx === srcDayIdx ? srcActs : updated[dstDayIdx].activities;

      const [moved] = srcActs.splice(oldIndex, 1);
      dstActs.splice(newIndex, 0, moved);

      updated[srcDayIdx].activities = srcActs;
      updated[dstDayIdx].activities = dstActs;

      return updated;
    });
  }

  function handleDragEnd(): void {
    setActiveId(null);
    setActiveItem(null);
  }

  return {
    days,
    setDays,
    activeId,
    activeItem,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
