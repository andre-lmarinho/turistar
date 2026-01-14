"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DayPlan } from "@/features/app/planner/domain/types/PlannerEntities";

import { normalizeAmount } from "@/features/app/planner/domain/utils/normalizeAmount";
import { DollarSign, X } from "@/shared/ui/icon";

interface BudgetDialogProps {
  open: boolean;
  days: DayPlan[];
  onUpdate: (id: string, amount: number) => void;
  onClose: () => void;
}

export function BudgetDialog({ open, days, onUpdate, onClose }: BudgetDialogProps) {
  const activities = useMemo(
    () => days.flatMap((day) => day.activities.map((activity) => ({ ...activity, dayLabel: day.label }))),
    [days]
  );

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const prevOpen = useRef(open);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && !prevOpen.current) {
      const initialValues: Record<string, string> = {};
      for (const activity of activities) {
        initialValues[activity.id] = activity.budget ? String(activity.budget) : "";
      }
      setInputs(initialValues);
      setShouldAutoFocus(true);
    }
    prevOpen.current = open;
  }, [open, activities]);

  useEffect(() => {
    if (!shouldAutoFocus) return;
    firstInputRef.current?.focus();
    setShouldAutoFocus(false);
  }, [shouldAutoFocus]);

  const handleDialogClose = useCallback(() => {
    for (const [id, value] of Object.entries(inputs)) {
      onUpdate(id, normalizeAmount(value));
    }
    onClose();
  }, [inputs, onUpdate, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && handleDialogClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          data-radix-dialog-overlay=""
          className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-40 backdrop-blur-sm"
        />
        <Dialog.Content
          aria-labelledby="activities-budget-title"
          className="bg-background focus-visible:ring-primary fixed top-1/2 left-1/2 z-50 w-[95%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-0 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
          <div className="flex items-center justify-between border-b px-4 py-3 text-left">
            <Dialog.Title asChild>
              <h2 className="text-lg font-semibold">Budget Your Activities</h2>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                title="Close"
                className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors">
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>

          <ul
            aria-labelledby="activities-budget-title"
            className="scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent m-0 max-h-[70vh] list-none space-y-2 overflow-y-auto p-4">
            {activities.map((activity, index) => (
              <li key={activity.id} className="flex items-center justify-between gap-2">
                <span className="flex-1 truncate text-sm">
                  {activity.title || "Untitled"} - {activity.dayLabel}
                </span>
                <div className="bg-background grid w-28 grid-cols-[auto_1fr] items-center overflow-hidden rounded border">
                  <span className="bg-muted border-r">
                    <DollarSign aria-hidden="true" className="text-muted-foreground m-2 size-4" />
                  </span>
                  <input
                    id={`budget-${activity.id}`}
                    ref={index === 0 ? firstInputRef : undefined}
                    autoComplete="off"
                    value={inputs[activity.id] ?? ""}
                    onChange={(event) =>
                      setInputs((prev) => ({ ...prev, [activity.id]: event.target.value }))
                    }
                    placeholder="Budget"
                    aria-label={`Budget for ${activity.title || "untitled"} - ${activity.dayLabel}`}
                    className="focus:ring-primary w-full bg-transparent px-2 py-1 text-right outline-none focus:ring-2 focus:ring-offset-2"
                    inputMode="decimal"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
