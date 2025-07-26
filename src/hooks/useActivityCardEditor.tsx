// src/hooks/useActivityCardEditor.tsx

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEscapeKey } from '@/hooks';

export function useActivityCardEditor({
  title,
  onTitleSave,
}: {
  title: string;
  imageUrl?: string;
  onTitleSave?: (s: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEscapeKey({ onClose: () => editing && cancel(), isActive: editing });

  useEffect(() => {
    const handleResize = () =>
      editing && cardRef.current && setRect(cardRef.current.getBoundingClientRect());
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [editing]);

  function start() {
    if (cardRef.current) setRect(cardRef.current.getBoundingClientRect());
    setEditing(true);
  }
  function save() {
    const t = draft.trim();
    if (t && t !== title) onTitleSave?.(t);
    setEditing(false);
  }
  function cancel() {
    setDraft(title);
    setEditing(false);
  }

  const backdrop = editing
    ? createPortal(<div className="backdrop-overlay" onClick={cancel} />, document.body)
    : null;

  const overlay =
    editing && rect
      ? createPortal(
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
          ></div>,
          document.body
        )
      : null;

  return {
    editing,
    draft,
    setDraft,
    inputRef,
    cardRef,
    overlayRef,
    start,
    save,
    cancel,
    backdrop,
    overlay,
  } as const;
}
