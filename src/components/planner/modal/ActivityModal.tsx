// src/components/planner/modal/ActivityModal.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
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

  const containerRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState(activity);

  useEffect(() => {
    setDraft(activity);
  }, [activity]);

  function handleCatalogSelect(item: CatalogActivity) {
    setDraft((prev) => ({
      ...prev,
      title: item.name,
      description: item.description,
      address: item.address,
      imageUrl: item.imageUrl,
      category: item.category,
    }));
  }

  function handleImageChange(url: string) {
    setDraft((prev) => ({ ...prev, imageUrl: url }));
  }

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="backdrop-overlay flex items-center justify-center" onClick={onClose}>
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
          aria-labelledby="activity-modal-title"
          tabIndex={-1}
          className="bg-background focus:ring-primary flex w-[95%] max-w-[452px] flex-col rounded-lg shadow-xl focus:ring-2 focus:outline-none"
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
            onImageChange={handleImageChange}
          />
          <ActivityModalForm activity={draft} onSave={onSave} color={color} />
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
