// src/components/planner/dnd/ActivityCard.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components';
import type { Activity } from '@/types';
import { isTouchDevice } from '@/lib';
import { ActivityCardBase } from './ActivityCardBase';

interface ActivityCardProps {
  activity: Activity;
  onSelect?: () => void;
  onTitleSave?: (newTitle: string) => void;
}

export default function ActivityCard({ activity, onSelect, onTitleSave }: ActivityCardProps) {
  const { title, duration, budget, color, imageUrl } = activity;
  const twBg = color && !color.startsWith('#') ? color : undefined;
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function save() {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== title) {
      onTitleSave?.(trimmed);
    }
    setEditing(false);
  }

  function cancel() {
    setDraftTitle(title);
    setEditing(false);
  }

  return (
    <>
      {editing &&
        ReactDOM.createPortal(<div className="backdrop-overlay" onClick={cancel} />, document.body)}

      <div
        className="group relative"
        onClick={() => {
          if (!editing) onSelect?.();
        }}
        onContextMenu={(e) => {
          if (isTouchDevice()) return;
          e.preventDefault();
          if (!editing) setEditing(true);
        }}
      >
        <ActivityCardBase
          editing={editing}
          title={title}
          draftTitle={draftTitle}
          onDraftTitleChange={setDraftTitle}
          onSave={save}
          inputRef={inputRef}
          imageUrl={imageUrl}
          duration={duration}
          twBg={twBg}
          budget={budget}
        />

        {editing && (
          <div className="relative pt-4 z-50">
            <Button type="button" size="sm" className="cursor-pointer" onClick={save}>
              Update
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
