// src/features/planner/components/dialog/ActivityDialog.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ActivityDialogHeader from '@/features/planner/components/dialog/ActivityDialogHeader';
import ActivityDialogForm from '@/features/planner/components/dialog/ActivityDialogForm';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import { Dialog } from '@/shared/ui/dialog';
import type { Activity } from '@/features/planner/domain/types/PlannerEntities';

export default function ActivityDialog() {
  const {
    selectedActivity: activity,
    closeDialog,
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

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      overlayClassName="backdrop-overlay"
      aria-labelledby="activity-dialog-title"
      className="bg-background focus:ring-primary flex w-[95%] max-w-[452px] flex-col rounded-lg shadow-xl focus:ring-2 focus:outline-none"
    >
      <h2 id="activity-dialog-title" className="sr-only">
        Edit Activity
      </h2>
      <ActivityDialogHeader
        activity={draft}
        bgColor={activity.color}
        onDelete={deleteActivity}
        onClose={closeDialog}
        onColorChange={(color) => changeColor(activity.id, color)}
        availableDays={days}
        onChangeDay={(dayId) => changeDay(activity.id, dayId)}
        onChangePosition={(idx) => changePosition(activity.id, idx)}
        onImageChange={handleImageChange}
      />
      <ActivityDialogForm activity={draft} onSave={save} color={activity.color} />
    </Dialog>
  );
}
