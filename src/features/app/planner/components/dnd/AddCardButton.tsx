"use client";

import { useMemo } from "react";
import { ACTIVITY_COPY } from "@/features/app/planner/domain/constants/activity";
import { usePlannerContext } from "@/features/app/planner/hooks/PlannerContext";
import { Plus } from "@/shared/ui/icon";
import { cn } from "@/shared/utils/cn";

const INLINE_ADD_ENABLED =
  process.env.NEXT_PUBLIC_PLANNER_INLINE_ADD === undefined ||
  !["0", "false", "off"].includes(String(process.env.NEXT_PUBLIC_PLANNER_INLINE_ADD).toLowerCase());

export type AddCardPlacement = "between" | "end";

interface AddCardButtonProps {
  dayId: string;
  insertIndex: number;
  className?: string;
  placement?: AddCardPlacement;
  onInlineOpen?: (index: number) => void;
  isInlineOpen?: boolean;
  isHidden?: boolean;
}

export function AddCardButton({
  dayId,
  insertIndex,
  className,
  placement = "end",
  onInlineOpen,
  isInlineOpen = false,
  isHidden = false,
}: AddCardButtonProps) {
  const { addBlankAndSelect } = usePlannerContext();
  const copy = ACTIVITY_COPY.inlineAdd;

  const collapsedClasses = useMemo(() => {
    if (placement === "between") {
      return "group cursor-pointer relative flex h-2 w-full items-center justify-center transition";
    }
    return "flex h-10 cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition";
  }, [placement]);

  const handleClick = () => {
    if (!INLINE_ADD_ENABLED || !onInlineOpen) {
      addBlankAndSelect(dayId, insertIndex);
      return;
    }

    onInlineOpen(insertIndex);
  };

  const buttonClassName = cn(collapsedClasses, className, isHidden && "hidden");

  if (placement === "between") {
    return (
      <button type="button" aria-expanded={isInlineOpen} onClick={handleClick} className={buttonClassName}>
        <span className="sr-only">{copy.collapsedLabel}</span>
        <Plus
          size={20}
          aria-hidden="true"
          className="bg-card z-10 h-5 w-6 rounded opacity-0 shadow-md transition-opacity group-hover:opacity-100"
        />
        <span className="border-border absolute inset-x-0 top-1/2 h-px -translate-y-1/2 border-t-2 border-dashed opacity-0 transition group-hover:opacity-100"></span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-expanded={isInlineOpen}
      onClick={handleClick}
      className={cn(buttonClassName, "bg-background hover:bg-card text-foreground text-left")}>
      <Plus size={18} aria-hidden="true" />
      <span>{copy.collapsedLabel}</span>
    </button>
  );
}
