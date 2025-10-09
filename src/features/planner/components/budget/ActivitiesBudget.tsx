// src/features/planner/components/budget/ActivitiesBudget.tsx
'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DollarSign } from 'lucide-react';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Modal, ModalContent } from '@/shared/ui/modal';
import { normalizeAmount } from '@/shared/utils/normalizeAmount';
import type { DayPlan } from '@/features/planner/domain/types/PlannerEntities';

interface ActivitiesBudgetProps {
  open: boolean;
  days: DayPlan[];
  onUpdate: (id: string, amount: number) => void;
  onClose: () => void;
}

export default function ActivitiesBudget({ open, days, onUpdate, onClose }: ActivitiesBudgetProps) {
  const activities = useMemo(
    () => days.flatMap((day) => day.activities.map((a) => ({ ...a, dayLabel: day.label }))),
    [days]
  );

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const prevOpen = useRef(open);
  const closingRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      const init: Record<string, string> = {};
      for (const act of activities) {
        init[act.id] = act.budget ? String(act.budget) : '';
      }
      setInputs(init);
      setShouldAutoFocus(true);
      closingRef.current = false;
    }
    prevOpen.current = open;
  }, [open, activities]);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    for (const [id, val] of Object.entries(inputs)) {
      onUpdate(id, normalizeAmount(val));
    }
    onClose();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (closingRef.current) {
            closingRef.current = false;
            return;
          }
          handleClose();
        }
      }}
    >
      <ModalContent
        aria-labelledby="activities-budget-title"
        className="focus-visible:ring-primary w-[95%] max-w-md"
        overlayProps={{ className: 'backdrop-overlay' }}
      >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 id="activities-budget-title" className="font-bold">
          Budget Your Activities
        </h3>
        <Button
          type="button"
          size="icon"
          title="Close"
          icon="x"
          aria-label="Close activities budget dialog"
          onClick={handleClose}
        />
      </div>

      <div
        role="list"
        aria-labelledby="activities-budget-title"
        className="scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent max-h-[70vh] space-y-2 overflow-y-auto p-4"
      >
        {activities.map((act, idx) => (
          <div key={act.id} role="listitem" className="flex items-center justify-between gap-2">
            <span className="flex-1 truncate text-sm">
              {act.title || 'Untitled'} – {act.dayLabel}
            </span>
            <Input
              autoFocus={idx === 0 && shouldAutoFocus}
              onFocus={idx === 0 ? () => setShouldAutoFocus(false) : undefined}
              autoComplete="off"
              labelId={`budget-${act.id}`}
              value={inputs[act.id] ?? ''}
              onValueChange={(v) => setInputs((prev) => ({ ...prev, [act.id]: v }))}
              inputSize="sm"
              background="default"
              placeholder="Budget"
              aria-label={`Budget for ${act.title || 'untitled'} – ${act.dayLabel}`}
              icon={<DollarSign aria-hidden="true" className="text-muted-foreground size-4" />}
            />
          </div>
        ))}
      </div>
      </ModalContent>
    </Modal>
  );
}
