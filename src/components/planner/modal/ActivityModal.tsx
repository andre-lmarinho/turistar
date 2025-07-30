// src/components/planner/modal/ActivityModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { ActivityModalHeader, ActivityModalForm, Modal } from '@/components';
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
      address: item.address,
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
      onClose={onClose}
      overlayClassName="backdrop-overlay"
      aria-labelledby="activity-modal-title"
      className="bg-background focus:ring-primary flex w-[95%] max-w-[452px] flex-col rounded-lg shadow-xl focus:ring-2 focus:outline-none"
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
    </Modal>
  );
}
