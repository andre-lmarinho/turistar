// src/features/planner/hooks/useActivityCardEditor.ts

import { useState, useRef } from 'react';
import { useEscapeKey } from '@/shared/hooks/ui/useEscapeKey';

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

  useEscapeKey({ onClose: () => editing && cancel(), isActive: editing });

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
