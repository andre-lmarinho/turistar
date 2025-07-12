// src/components/planner/dnd/DragOverlayFallback.tsx
'use client';

import React from 'react';

/**
 * Fallback UI for when no activity is currently active during drag.
 * Prevents empty overlay and gives visual feedback during edge cases.
 */
export default function DragOverlayFallback() {
  return (
    <div className="w-[220px] h-[120px] rounded-md bg-muted flex items-center justify-center shadow text-sm text-muted-foreground italic">
      Moving item...
    </div>
  );
}
