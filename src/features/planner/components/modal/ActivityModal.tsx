// src/features/planner/components/modal/ActivityModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ActivityModalHeader from '@/features/planner/components/modal/ActivityModalHeader';
import ActivityModalForm from '@/features/planner/components/modal/ActivityModalForm';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import { Modal, ModalContent } from '@/shared/ui/modal';
import type { Activity } from '@/features/planner/domain/types/PlannerEntities';

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

  const [draft, setDraft] = useState(activity ?? ({} as Activity));

  useEffect(() => {
    if (activity) setDraft(activity);
  }, [activity]);

  if (!activity) return null;

  function handleImageChange(url: string) {
    setDraft((prev) => ({ ...prev, imageUrl: url }));
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) closeModal();
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent
        aria-labelledby="activity-modal-title"
        className="bg-background focus-visible:ring-primary flex w-[95%] max-w-[452px] flex-col gap-0 rounded-lg border-none p-0 shadow-xl"
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
          onImageChange={handleImageChange}
        />
        <ActivityModalForm activity={draft} onSave={save} color={activity.color} />
      </ModalContent>
    </Modal>
  );
}
