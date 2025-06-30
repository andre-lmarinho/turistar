"use client";

import { CSS } from "@dnd-kit/utilities";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

/*  Types */
type Props = PropsWithChildren<
  {
    id: string;
    className?: string;
  } & HTMLAttributes<HTMLLIElement>
>;


/*  Sortable item */
export function SortableItem({
  id,
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border p-3 shadow-sm bg-card select-none",
        isDragging ? "cursor-grabbing opacity-50" : "cursor-grab",
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


/*  Wrapper for a vertical sortable list */
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
