// src/components/planner/modal/ActivityModalHaeder
'use client';

import React from 'react';
import RemoveCardButton from '@/components/ui/RemoveCardButton';
import CloseButton from '@/components/ui/CloseButton';

/**
 * Color strip shown at the very top of ActivityModal.
 * - Background colour = current card colour.
 * - Left: Trash icon (delete activity).
 * - Right: Standard CloseButton.
 */
export default function ActivityModalHeader({
  bgColor,
  onDelete,
  onClose,
}: {
  bgColor: string; // tailwind "bg-*" OR hex "#xxxxxx"
  onDelete: () => void;
  onClose: () => void;
}) {
  // Inline style se for hex, senão usa a classe Tailwind diretamente
  const style = bgColor.startsWith('#') ? { backgroundColor: bgColor } : undefined;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 ${
        bgColor.startsWith('#') ? '' : bgColor
      }`}
      style={style}
    >
      {/* Delete (left) */}
      <RemoveCardButton onClick={onDelete} />

      {/* Close (right) */}
      <CloseButton onClick={onClose} title="Close modal" />
    </div>
  );
}
