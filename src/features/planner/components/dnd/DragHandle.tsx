// src/features/planner/components/dnd/DragHandle.tsx
'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

interface DragHandleProps extends React.HTMLAttributes<HTMLButtonElement> {
  isDragging?: boolean;
}

export function DragHandle({ isDragging = false, className, ...props }: DragHandleProps) {
  return (
    <button
      type="button"
      aria-label="Reordenar atividade"
      {...props}
      className={cn(
        'absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-background/80 text-muted-foreground shadow-sm transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 touch-none select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab hover:bg-background',
        className
      )}
    >
      <GripVertical aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

export default DragHandle;

