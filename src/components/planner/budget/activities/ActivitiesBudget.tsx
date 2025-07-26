// src/components/planner/budget/activities/ActivitiesBudget.tsx
'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { DollarSign } from 'lucide-react';
import FocusTrap from 'focus-trap-react';

import { Input, CloseButton } from '@/components';
import { useEscapeKey } from '@/hooks';
import { normalizeAmount } from '@/utils';
import type { DayPlan } from '@/types';

interface ActivitiesBudgetProps {
  open: boolean;
  days: DayPlan[];
  onUpdate: (id: string, amount: number) => void;
  onClose: () => void;
}

export default function ActivitiesBudget({ open, days, onUpdate, onClose }: ActivitiesBudgetProps) {
  useEscapeKey({ onClose, isActive: open });

  const containerRef = useRef<HTMLDivElement>(null);

  const activities = useMemo(
    () => days.flatMap((day) => day.activities.map((a) => ({ ...a, dayLabel: day.label }))),
    [days]
  );

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);

  useEffect(() => {
    if (!open) return;
    const init: Record<string, string> = {};
    for (const act of activities) {
      init[act.id] = act.budget ? String(act.budget) : '';
    }
    setInputs(init);
    setShouldAutoFocus(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    for (const [id, val] of Object.entries(inputs)) {
      onUpdate(id, normalizeAmount(val));
    }
    onClose();
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="backdrop-overlay flex items-center justify-center" onClick={handleClose}>
      <FocusTrap
        active={open}
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          escapeDeactivates: false,
          initialFocus: false,
          fallbackFocus: () => containerRef.current ?? document.body,
          tabbableOptions: { displayCheck: 'none' },
        }}
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="activities-budget-title"
          tabIndex={-1}
          className="focus:ring-primary w-[95%] max-w-md rounded-lg bg-white shadow-xl focus:ring-2 focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h3 id="activities-budget-title" className="font-bold">
              Budget Your Activities
            </h3>
            <CloseButton onClick={handleClose} aria-label="Close activities budget dialog" />
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
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
