// src/components/planner/dnd/ActivityCardEditorOverlay.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

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
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (cardRef.current) setRect(cardRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, cardRef]);

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
