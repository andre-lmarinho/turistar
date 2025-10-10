'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DollarSign } from 'lucide-react';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { normalizeAmount } from '@/shared/utils/normalizeAmount';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

interface BudgetDialogProps {
  open: boolean;
  days: DayPlan[];
  onUpdate: (id: string, amount: number) => void;
  onClose: () => void;
}

export default function BudgetDialog({ open, days, onUpdate, onClose }: BudgetDialogProps) {
  const activities = useMemo(
    () => days.flatMap((day) => day.activities.map((activity) => ({ ...activity, dayLabel: day.label }))),
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

  const handleClose = () => {
    for (const [id, value] of Object.entries(inputs)) {
      onUpdate(id, normalizeAmount(value));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent
        size="md"
        className="w-[95%] max-w-md p-0"
        aria-labelledby="activities-budget-title"
        aria-describedby={undefined}
      >
        <DialogHeader className="border-b px-4 py-3 text-left">
          <DialogTitle id="activities-budget-title" className="text-lg font-semibold">
            Budget Your Activities
          </DialogTitle>
        </DialogHeader>

        <div
          role="list"
          aria-labelledby="activities-budget-title"
          className="scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent max-h-[70vh] space-y-2 overflow-y-auto p-4"
        >
          {activities.map((activity, index) => (
            <div key={activity.id} role="listitem" className="flex items-center justify-between gap-2">
              <span className="flex-1 truncate text-sm">
                {activity.title || 'Untitled'} – {activity.dayLabel}
              </span>
              <Input
                autoFocus={index === 0 && shouldAutoFocus}
                onFocus={index === 0 ? () => setShouldAutoFocus(false) : undefined}
                autoComplete="off"
                labelId={`budget-${activity.id}`}
                value={inputs[activity.id] ?? ''}
                onValueChange={(value) => setInputs((prev) => ({ ...prev, [activity.id]: value }))}
                inputSize="sm"
                background="default"
                placeholder="Budget"
                aria-label={`Budget for ${activity.title || 'untitled'} – ${activity.dayLabel}`}
                icon={<DollarSign aria-hidden="true" className="text-muted-foreground size-4" />}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t px-4 py-3">
          <DialogClose asChild>
            <Button type="button" variant="icon" size="icon" title="Close" icon="x" onClick={handleClose} />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
