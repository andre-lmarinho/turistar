'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { DollarSign, X } from '@/shared/ui/icon';

import { normalizeAmount } from '@/shared/utils/normalizeAmount';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

interface BudgetDialogProps {
  open: boolean;
  days: DayPlan[];
  onUpdate: (id: string, amount: number) => void;
  onClose: () => void;
}

export function BudgetDialog({ open, days, onUpdate, onClose }: BudgetDialogProps) {
  const activities = useMemo(
    () =>
      days.flatMap((day) =>
        day.activities.map((activity) => ({ ...activity, dayLabel: day.label }))
      ),
    [days]
  );

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      const initialValues: Record<string, string> = {};
      for (const activity of activities) {
        initialValues[activity.id] = activity.budget ? String(activity.budget) : '';
      }
      setInputs(initialValues);
      setShouldAutoFocus(true);
    }
    prevOpen.current = open;
  }, [open, activities]);

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
          aria-describedby="activities-budget-description"
          className="bg-background focus-visible:ring-primary fixed top-1/2 left-1/2 z-50 w-[95%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-0 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <div className="flex items-center justify-between border-b px-4 py-3 text-left">
            <Dialog.Title asChild>
              <h2 id="activities-budget-title" className="text-lg font-semibold">
                Budget Your Activities
              </h2>
            </Dialog.Title>
            <Dialog.Description id="activities-budget-description" className="sr-only">
              Adjust the budget assigned to each planned activity.
            </Dialog.Description>

            <Dialog.Close asChild>
              <button
                type="button"
                title="Close"
                className="text-muted-foreground hover:bg-muted/60 hover:text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors"
              >
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>

          <div
            role="list"
            aria-labelledby="activities-budget-title"
            className="scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent max-h-[70vh] space-y-2 overflow-y-auto p-4"
          >
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                role="listitem"
                className="flex items-center justify-between gap-2"
              >
                <span className="flex-1 truncate text-sm">
                  {activity.title || 'Untitled'} - {activity.dayLabel}
                </span>
                <div className="bg-background grid w-28 grid-cols-[auto_1fr] items-center overflow-hidden rounded border">
                  <span className="bg-muted border-r-1">
                    <DollarSign aria-hidden="true" className="text-muted-foreground m-2 size-4" />
                  </span>
                  <input
                    id={`budget-${activity.id}`}
                    autoFocus={index === 0 && shouldAutoFocus}
                    onFocus={index === 0 ? () => setShouldAutoFocus(false) : undefined}
                    autoComplete="off"
                    value={inputs[activity.id] ?? ''}
                    onChange={(event) =>
                      setInputs((prev) => ({ ...prev, [activity.id]: event.target.value }))
                    }
                    placeholder="Budget"
                    aria-label={`Budget for ${activity.title || 'untitled'} - ${activity.dayLabel}`}
                    className="focus:ring-primary w-full bg-transparent px-2 py-1 text-right outline-none focus:ring-2 focus:ring-offset-2"
                    inputMode="decimal"
                  />
                </div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
