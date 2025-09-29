// src/features/planner/hooks/usePlannerSensors.ts
'use client';

import { useEffect, useState } from 'react';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * Planner-specific DnD Kit sensors.
 *
 * Production builds rendered the planner on the server first, causing the
 * `PointerSensor` factory to run in a non-browser environment. DnD Kit then
 * fell back to its `TouchSensor` implementation which enforces a ~2s
 * long-press activation delay on coarse pointers. By delaying sensor creation
 * until after hydration and reusing the pointer sensor everywhere we remove
 * the long-press and keep drag start instant on Vercel builds.
 */
export function usePlannerSensors() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const pointer = useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  });
  const keyboard = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(pointer, keyboard);
  return isReady ? sensors : [];
}

