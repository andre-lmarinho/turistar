'use client';

import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { ActivityDialogHeader } from '@/features/planner/components/dialog/ActivityDialogHeader';
import { ActivityDialogForm } from '@/features/planner/components/dialog/ActivityDialogForm';
import { usePlannerContext } from '@/features/planner/hooks/PlannerContext';
import type { Activity } from '@/features/planner/domain/types/PlannerEntities';

export function ActivityDialog() {
  const {
    selectedActivity: activity,
    closeDialog,
    deleteActivity,
    changeColor,
    days,
    changeDay,
    changePosition,
    save,
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
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-40 backdrop-blur-sm" />
        <Dialog.Content
          aria-labelledby="activity-dialog-title"
          aria-describedby="activity-dialog-description"
          aria-modal="true"
          className="bg-background focus-visible:ring-primary fixed top-1/2 left-1/2 z-50 flex w-[95%] max-w-[452px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl p-0 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <Dialog.Title className="sr-only">Edit Activity</Dialog.Title>

          <ActivityDialogHeader
            activity={draft}
            bgColor={draft.color ?? activity.color}
            onDelete={deleteActivity}
            onClose={closeDialog}
            onColorChange={(color) => {
              setDraft((prev) => ({ ...prev, color }));
              changeColor(activity.id, color);
            }}
            availableDays={days}
            onChangeDay={(dayId) => changeDay(activity.id, dayId)}
            onChangePosition={(idx) => changePosition(activity.id, idx)}
            onImageChange={handleImageChange}
          />

          <ActivityDialogForm
            activity={draft}
            color={draft.color ?? activity.color}
            onSave={(patch) => save({ ...patch, imageUrl: draft.imageUrl })}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
