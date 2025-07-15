// src/components/planner/modal/ActivityModal.tsx
'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { ActivityModalHeader, ActivityModalForm } from '@/components';
import type { Activity, DayPlan } from '@/types';
import { useEscapeKey } from '@/hooks';

interface ActivityModalProps {
  open: boolean;
  activity: Activity & { dayId?: string };
  onClose: () => void;
  onDelete: () => void;
  onSave: (draft: Partial<Activity>) => void;
  color: string;
  onColorChange: (color: string) => void;
  days: DayPlan[];
  onChangeDay: (dayId: string) => void;
}

export default function ActivityModal({
  open,
  activity,
  onClose,
  onDelete,
  onSave,
  color,
  onColorChange,
  days,
  onChangeDay,
}: ActivityModalProps) {
  useEscapeKey({ onClose, isActive: open });

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="backdrop-overlay flex items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-modal-title"
        className="bg-white rounded-lg shadow-xl w-[95%] max-w-[452px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="activity-modal-title" className="sr-only">
          Edit Activity
        </h2>
        <ActivityModalHeader
          activity={activity}
          bgColor={color}
          onDelete={onDelete}
          onClose={onClose}
          onColorChange={onColorChange}
          availableDays={days}
          onChangeDay={onChangeDay}
        />

        <ActivityModalForm activity={activity} onSave={onSave} color={color} />
      </div>
    </div>,
    document.body
  );
}
