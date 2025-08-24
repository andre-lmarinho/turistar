// src/features/planner/components/dnd/ActivityCardEditorOverlay.tsx
'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { useElementRect } from '@/shared/hooks/ui/useElementRect';

interface Props {
  open: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ActivityCardEditorOverlay({
  open,
  cardRef,
  overlayRef,
  onClose,
  children,
}: Props) {
  const rect = useElementRect(cardRef);

  if (!open || !rect) return null;

  return ReactDOM.createPortal(
    <>
      <div className="backdrop-overlay" onClick={onClose} />
      <div
        ref={overlayRef}
        className="fixed z-50"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
