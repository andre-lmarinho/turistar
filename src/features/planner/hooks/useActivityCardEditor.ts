// src/features/planner/hooks/useActivityCardEditor.ts

import { useState, useRef } from 'react';
import { usePopupDismiss } from '@/shared/hooks/ui/usePopupDismiss';

export function useActivityCardEditor({
  title,
  onTitleSave,
}: {
  title: string;
  onTitleSave?: (s: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  usePopupDismiss({
    popupRef: overlayRef,
    triggerRef: cardRef,
    onClose: () => editing && cancel(),
    isOpen: editing,
  });

  function start() {
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
  } as const;
}
