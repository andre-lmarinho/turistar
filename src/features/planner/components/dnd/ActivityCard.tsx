// src/features/planner/components/dnd/ActivityCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { isTouchDevice } from '@/shared/utils';
import { useActivityCardEditor } from '@/features/planner';
import { useCardColors } from '@/shared/hooks/ui/useCardColors';
import type { Activity, DayPlan } from '@/shared/types';
import {
  ActivityCardBase,
  ActivityCardEditing,
  ActivityCardEditorOverlay,
} from '@/features/planner';
import { IconButton } from '@/shared/ui';
import { Pencil } from 'lucide-react';

export interface ActivityCardProps {
  activity: Activity & { dayId?: string };
  onSelect?: () => void;
  onTitleSave?: (newTitle: string) => void;
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  availableDays: DayPlan[];
  bgColor: string;
  onChangeColor: (color: string) => void;
  onDelete: () => void;
  onUpdateImage?: (url: string) => void;
}

export default function ActivityCard({
  activity,
  availableDays,
  onSelect,
  onTitleSave,
  onChangeDay,
  onChangePosition,
  onDelete,
  bgColor,
  onChangeColor,
  onUpdateImage,
}: ActivityCardProps) {
  const { title, duration, budget, color, imageUrl } = activity;

  const { twBg, border: borderColorClass } = useCardColors(
    color && !color.startsWith('#') ? color : undefined,
    bgColor
  );

  const { editing, draft, setDraft, inputRef, cardRef, overlayRef, start, save, cancel } =
    useActivityCardEditor({
      title,
      imageUrl,
      onTitleSave,
    });

  const [editedImageUrl, setEditedImageUrl] = useState(imageUrl ?? '');

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, inputRef]);

  return (
    <>
      <div
        ref={cardRef}
        className="group relative"
        style={{ visibility: editing ? 'hidden' : undefined }}
      >
        <button
          type="button"
          className="w-full text-left"
          onClick={() => !editing && onSelect?.()}
          onKeyDown={(e) => {
            if (!editing && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onSelect?.();
            }
          }}
          onContextMenu={(e) => {
            if (isTouchDevice()) return;
            e.preventDefault();
            if (!editing) start();
          }}
        >
          <ActivityCardBase
            editing={false}
            title={title}
            draftTitle={draft}
            onDraftTitleChange={setDraft}
            onSave={save}
            inputRef={inputRef}
            imageUrl={imageUrl}
            duration={duration}
            twBg={twBg}
            budget={budget}
            borderColorClass={borderColorClass}
          />
        </button>

        {!editing && (
          <IconButton
            icon={<Pencil aria-hidden="true" />}
            ariaLabel="Edit Card"
            position="bottom"
            type="button"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              start();
            }}
          />
        )}
      </div>

      <ActivityCardEditorOverlay
        open={editing}
        cardRef={cardRef}
        overlayRef={overlayRef}
        onClose={cancel}
      >
        <ActivityCardBase
          editing={true}
          title={title}
          draftTitle={draft}
          onDraftTitleChange={setDraft}
          onSave={() => {
            onUpdateImage?.(editedImageUrl);
            save();
          }}
          inputRef={inputRef}
          imageUrl={editedImageUrl}
          duration={duration}
          twBg={twBg}
          budget={budget}
          borderColorClass={borderColorClass}
        />
        <ActivityCardEditing
          cardRef={overlayRef}
          activity={activity}
          availableDays={availableDays}
          bgColor={bgColor}
          onChangeColor={onChangeColor}
          onChangeDay={onChangeDay}
          onChangePosition={onChangePosition}
          onSave={(url) => {
            onUpdateImage?.(url);
            save();
          }}
          onCancel={cancel}
          onDelete={onDelete}
          editedImageUrl={editedImageUrl}
          setEditedImageUrl={setEditedImageUrl}
        />
      </ActivityCardEditorOverlay>
    </>
  );
}
