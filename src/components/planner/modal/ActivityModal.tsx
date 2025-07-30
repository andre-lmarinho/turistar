// src/components/planner/modal/ActivityModal.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { ActivityModalHeader, ActivityModalForm } from '@/components';
import type { Activity, CatalogActivity } from '@/types';
import { useEscapeKey } from '@/hooks';
import { usePlannerContext } from '@/contexts/PlannerContext';

export default function ActivityModal() {
  const {
    selectedActivity,
    closeModal,
    deleteActivity,
    save,
    changeColor,
    days,
    changeDay,
    changePosition,
  } = usePlannerContext();

  const open = Boolean(selectedActivity);
  useEscapeKey({ onClose: closeModal, isActive: open });

  const containerRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<(Activity & { dayId?: string }) | null>(selectedActivity);

  useEffect(() => {
    setDraft(selectedActivity);
  }, [selectedActivity]);

  function handleCatalogSelect(item: CatalogActivity) {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            title: item.name,
            description: item.description,
            address: item.address,
            imageUrl: item.imageUrl,
            category: item.category,
          }
        : prev
    );
  }

  function handleImageChange(url: string) {
    setDraft((prev) => (prev ? { ...prev, imageUrl: url } : prev));
  }

  if (!open || !draft) return null;

  return ReactDOM.createPortal(
    <div className="backdrop-overlay flex items-center justify-center" onClick={closeModal}>
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
            bgColor={draft.color}
            onDelete={deleteActivity}
            onClose={closeModal}
            onColorChange={(c) => changeColor(draft.id, c)}
            availableDays={days}
            onChangeDay={(dId) => changeDay(draft.id, dId)}
            onChangePosition={(idx) => changePosition(draft.id, idx)}
            onCatalogSelect={handleCatalogSelect}
            onImageChange={handleImageChange}
          />
          <ActivityModalForm activity={draft} onSave={save} color={draft.color} />
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
