// src/components/planner/dnd/DragOverlayFallback.tsx
'use client';

import React from 'react';

/**
 * Fallback UI for when no activity is currently active during drag.
 * Prevents empty overlay and gives visual feedback during edge cases.
 */
export default function DragOverlayFallback() {
  return (
    <div className="bg-muted text-muted-foreground flex h-[120px] w-[220px] items-center justify-center rounded-md text-sm italic shadow">
      Moving item...
    </div>
  );
}
