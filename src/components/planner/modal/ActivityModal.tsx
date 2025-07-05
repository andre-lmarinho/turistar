// src/components/planner/modal/ActivityModal.tsx
'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import ActivityModalHeader from '@/components/planner/modal/ActivityModalHeader';
import ActivityModalForm from '@/components/planner/modal/ActivityModalForm';
import type { Activity } from '@/types/itinerary';

interface ActivityModalProps {
  open: boolean;
  activity: Activity;
  onClose: () => void;
  onDelete: () => void;
  onSave: (draft: Partial<Activity>) => void;
  color: string;
  onColorChange: (color: string) => void;
}

export default function ActivityModal({
  open,
  activity,
  onClose,
  onDelete,
  onSave,
  color,
  onColorChange,
}: ActivityModalProps) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 top-50 left-50 items-center justify-center w-[95%] max-w-[650px] max-h-[95dvh]">
        <div
          className="bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <ActivityModalHeader bgColor={color} onDelete={onDelete} onClose={onClose} />

          {/* Form */}
          <ActivityModalForm
            activity={activity}
            onClose={onClose}
            onSave={onSave}
            color={color}
            onColorChange={onColorChange}
          />
        </div>
      </div>
    </>,
    document.body
  );
}
