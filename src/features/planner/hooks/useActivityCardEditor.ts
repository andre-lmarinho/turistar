import { useCallback, useRef, useState } from 'react';

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
  const start = useCallback(() => {
    setEditing(true);
  }, []);
  const save = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onTitleSave?.(trimmed);
    setEditing(false);
  }, [draft, onTitleSave, title]);
  const cancel = useCallback(() => {
    setDraft(title);
    setEditing(false);
  }, [title]);

  return {
    editing,
    draft,
    setDraft,
    inputRef,
    cardRef,
    start,
    save,
    cancel,
  } as const;
}
