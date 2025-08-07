// src/features/planner/components/modal/ActivityModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { ActivityModalHeader, ActivityModalForm, usePlannerContext } from '@/features/planner';
import { Modal } from '@/shared/ui';
import type { Activity, CatalogActivity } from '@/shared/types';
import { useEscapeKey } from '@/shared/hooks/ui/useEscapeKey';

export default function ActivityModal() {
  const {
    selectedActivity: activity,
    closeModal,
    save,
    deleteActivity,
    changeColor,
    days,
    changeDay,
    changePosition,
  } = usePlannerContext();
  const open = Boolean(activity);
  useEscapeKey({ onClose: closeModal, isActive: open });

  const [draft, setDraft] = useState(activity ?? ({} as Activity));

  useEffect(() => {
    if (activity) setDraft(activity);
  }, [activity]);

  if (!activity) return null;

  function handleCatalogSelect(item: CatalogActivity) {
    setDraft((prev) => ({
      ...prev,
      title: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category,
    }));
  }

  function handleImageChange(url: string) {
    setDraft((prev) => ({ ...prev, imageUrl: url }));
  }

  return (
    <Modal
      open={open}
      onClose={closeModal}
      overlayClassName="backdrop-overlay"
      aria-labelledby="activity-modal-title"
      className="bg-background focus:ring-primary flex w-[95%] max-w-[452px] flex-col rounded-lg shadow-xl focus:ring-2 focus:outline-none"
    >
      <h2 id="activity-modal-title" className="sr-only">
        Edit Activity
      </h2>
      <ActivityModalHeader
        activity={draft}
        bgColor={activity.color}
        onDelete={deleteActivity}
        onClose={closeModal}
        onColorChange={(color) => changeColor(activity.id, color)}
        availableDays={days}
        onChangeDay={(dayId) => changeDay(activity.id, dayId)}
        onChangePosition={(idx) => changePosition(activity.id, idx)}
        onCatalogSelect={handleCatalogSelect}
        onImageChange={handleImageChange}
      />
      <ActivityModalForm activity={draft} onSave={save} color={activity.color} />
    </Modal>
  );
}
