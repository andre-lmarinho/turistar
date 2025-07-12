// src/components/planner/modal/ActivityModalHeader.tsx
'use client';

import React, { useState } from 'react';
import type { Activity } from '@/types';

import { RemoveCardButton, CloseButton, CardColorButton } from '@/components';
import HeaderBackgroundPicker from './HeaderBackgroundPicker';

/**
 * Color strip shown at the very top of ActivityModal.
 * - Background colour = current card colour.
 */
export default function ActivityModalHeader({
  activity,
  bgColor,
  onDelete,
  onClose,
  onColorChange,
}: {
  activity: Activity;
  bgColor: string;
  onDelete: () => void;
  onClose: () => void;
  onColorChange: (color: string) => void;
}) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');

  return (
    <>
      <div
        className={`relative mb-4 rounded-t-lg ${
          editedImageUrl ? 'h-32' : ''
        } ${!editedImageUrl && !bgColor.startsWith('#') ? bgColor : ''}`}
        style={bgColor.startsWith('#') ? { backgroundColor: bgColor } : undefined}
      >
        {editedImageUrl && (
          <img
            src={editedImageUrl}
            alt={activity.title}
            className="absolute top-0 left-0 rounded-t-lg w-full h-full object-cover"
          />
        )}

        {/* Top-right buttons */}
        <div className="relative z-10 flex items-center justify-end gap-2 p-2">
          <RemoveCardButton onClick={onDelete} />
          <CardColorButton onClick={() => setIsColorPickerOpen((prev) => !prev)} />
          <CloseButton onClick={onClose} />
        </div>
        {/* Color picker - rendered inside the header */}
        {isColorPickerOpen && (
          <div className="absolute top-[3rem] right-[1rem] z-50">
            <HeaderBackgroundPicker
              imageUrl={editedImageUrl}
              onChangeImage={(url: string) => setEditedImageUrl(url)}
              onClearImage={() => setEditedImageUrl('')}
              selectedColor={bgColor}
              onChangeColor={(selectedColor: string) => {
                onColorChange(selectedColor);
                setIsColorPickerOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
