// src/components/dnd/SortableItem.tsx
"use client";

import { CSS } from "@dnd-kit/utilities";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type Props = PropsWithChildren<{
  id: string;
  dragOverlay?: boolean; // true when rendered inside <DragOverlay>
  className?: string;
}> &
  HTMLAttributes<HTMLLIElement>;

/* ------------------------------------------------------------------ */
/*  Sortable item                                                     */
/* ------------------------------------------------------------------ */
export function SortableItem({
  id,
  dragOverlay = false,
  className,
  children,
  ...rest
}: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = dragOverlay
    ? { transform: undefined, transition: undefined } // overlay follows cursor
    : { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border p-3 shadow-sm bg-card select-none",
        isDragging && !dragOverlay ? "opacity-50 cursor-grabbing" : "cursor-grab",
        dragOverlay && "shadow-lg cursor-grabbing",
        className
      )}
      {...attributes}
      {...listeners}
      {...rest}
    >
      {children}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Wrapper for a vertical sortable list                              */
/* ------------------------------------------------------------------ */
export const SortableColumn = ({
  ids,
  children,
}: {
  ids: string[];
  children: React.ReactNode;
}) => (
  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
    {children}
  </SortableContext>
);
