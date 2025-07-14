// src/components/planner/dnd/ActivityCard.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { Activity, DayPlan } from '@/types';
import { isTouchDevice } from '@/lib';

import { EditCardButton, ActivityCardBase, ActivityCardEditing } from '@/components';

export interface ActivityCardProps {
  activity: Activity & { dayId?: string };
  onSelect?: () => void;
  onTitleSave?: (newTitle: string) => void;
  onChangeDay: (dayId: string) => void;
  availableDays: DayPlan[];
  bgColor: string;
  onChangeColor: (color: string) => void;
}

export default function ActivityCard({
  activity,
  availableDays,
  onSelect,
  onTitleSave,
  onChangeDay,
  bgColor,
  onChangeColor,
}: ActivityCardProps) {
  const { title, duration, budget, color, imageUrl } = activity;
  const twBg = color && !color.startsWith('#') ? color : undefined;
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');

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
        role="button"
        tabIndex={0}
        className="group relative"
        ref={cardRef}
        onClick={() => {
          if (!editing) onSelect?.();
        }}
        onKeyDown={(e) => {
          if (!editing && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect?.();
          }
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

        {!editing && (
          <EditCardButton
            type="button"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          />
        )}

        {editing && (
          <ActivityCardEditing
            cardRef={cardRef}
            activity={activity}
            availableDays={availableDays}
            bgColor={bgColor}
            onChangeColor={onChangeColor}
            onChangeDay={onChangeDay}
            onSave={save}
            onCancel={cancel}
            editedImageUrl={editedImageUrl}
            setEditedImageUrl={setEditedImageUrl}
          />
        )}
      </div>
    </>
  );
}
