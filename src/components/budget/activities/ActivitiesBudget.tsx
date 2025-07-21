// src/components/budget/activities/ActivitiesBudget.tsx
'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { DollarSign } from 'lucide-react';
import FocusTrap from 'focus-trap-react';

import { Input, CloseButton } from '@/components';
import { useEscapeKey } from '@/hooks';
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

  const normalizeAmount = (val: string) => {
    const cleaned = val
      .replace(/[^0-9.]/g, '')
      .replace(/,/g, '')
      .replace(/^0+(?!\.)/, '');
    const num = parseFloat(cleaned);
    return isFinite(num) ? num : 0;
  };

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
          className="bg-white rounded-lg shadow-xl w-[95%] max-w-md focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 id="activities-budget-title" className="font-bold">
              Budget Your Activities
            </h3>
            <CloseButton onClick={handleClose} aria-label="Close activities budget dialog" />
          </div>

          <div
            role="list"
            aria-labelledby="activities-budget-title"
            className="p-4 space-y-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-track-transparent"
          >
            {activities.map((act, idx) => (
              <div key={act.id} role="listitem" className="flex items-center justify-between gap-2">
                <span className="truncate text-sm flex-1">
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
                  icon={<DollarSign aria-hidden="true" className="size-4 text-muted-foreground" />}
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
