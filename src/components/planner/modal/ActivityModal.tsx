// src/components/planner/modal/ActivityModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { ActivityModalHeader, ActivityModalForm } from '@/components';
import type { Activity, DayPlan, CatalogActivity } from '@/types';
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
  onChangePosition: (index: number) => void;
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
  onChangePosition,
}: ActivityModalProps) {
  useEscapeKey({ onClose, isActive: open });

  const [draft, setDraft] = useState(activity);

  useEffect(() => {
    setDraft(activity);
  }, [activity]);

  function handleCatalogSelect(item: CatalogActivity) {
    setDraft((prev) => ({
      ...prev,
      title: item.name,
      description: item.description,
      duration: item.duration,
      imageUrl: item.image_url,
      category: item.category,
    }));
  }

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="backdrop-overlay flex items-center justify-center" onClick={onClose}>
      <FocusTrap
        active={open}
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          escapeDeactivates: false,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-modal-title"
          tabIndex={-1}
          className="bg-background rounded-lg shadow-xl w-[95%] max-w-[452px] flex flex-col focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="activity-modal-title" className="sr-only">
            Edit Activity
          </h2>
          <ActivityModalHeader
            activity={draft}
            bgColor={color}
            onDelete={onDelete}
            onClose={onClose}
            onColorChange={onColorChange}
            availableDays={days}
            onChangeDay={onChangeDay}
            onChangePosition={onChangePosition}
            onCatalogSelect={handleCatalogSelect}
          />
          <ActivityModalForm activity={draft} onSave={onSave} color={color} />
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
