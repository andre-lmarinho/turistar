// src/components/planner/modal/ActivityModalHeader.tsx
'use client';

import React, { useState } from 'react';

import { RemoveCardButton, CloseButton, CardColorButton, ColorSwatchPicker } from '@/components';

/**
 * Color strip shown at the very top of ActivityModal.
 * - Background colour = current card colour.
 */
export default function ActivityModalHeader({
  bgColor,
  onDelete,
  onClose,
  onColorChange,
}: {
  bgColor: string; // tailwind "bg-*" OR hex "#xxxxxx"
  onDelete: () => void;
  onClose: () => void;
  onColorChange: (color: string) => void;
}) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Inline style se for hex, senão usa a classe Tailwind diretamente
  const style = bgColor.startsWith('#') ? { backgroundColor: bgColor } : undefined;

  return (
    <>
      <div
        className={`flex items-center rounded-t-lg gap-2 justify-end px-4 py-2 ${
          bgColor.startsWith('#') ? '' : bgColor
        }`}
        style={style}
      >
        <RemoveCardButton onClick={onDelete} />
        <CardColorButton onClick={() => setIsColorPickerOpen((prev) => !prev)} />
        <CloseButton onClick={onClose} />
      </div>
      {/* Color picker - rendered inside the header */}
      {isColorPickerOpen && (
        <div className="absolute top-14 right-4 z-50">
          <ColorSwatchPicker
            value={bgColor}
            onChange={(selectedColor) => {
              onColorChange(selectedColor);
              setIsColorPickerOpen(false); // Close picker after selecting
            }}
          />
        </div>
      )}
    </>
  );
}
