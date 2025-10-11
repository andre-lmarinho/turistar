'use client';

import React, { useEffect } from 'react';

import type { Activity } from '@/features/planner/domain/types/PlannerEntities';
import { useActivityCardEditor } from '@/features/planner/hooks/useActivityCardEditor';
import { useCardColors } from '@/features/planner/hooks/internal/useCardColors';
import ActivityCardBase from './ActivityCardBase';

export interface ActivityCardProps {
  activity: Activity & { dayId?: string };
  onSelect?: () => void;
  onTitleSave?: (newTitle: string) => void;
  bgColor: string;
}

export default function ActivityCard({
  activity,
  onSelect,
  onTitleSave,
  bgColor,
}: ActivityCardProps) {
  const { title, duration, budget, color, imageUrl } = activity;

  const { twBg, border: borderColorClass } = useCardColors(
    color && !color.startsWith('#') ? color : undefined,
    bgColor
  );

  const { editing, draft, setDraft, inputRef, cardRef, save } = useActivityCardEditor({
    title,
    onTitleSave,
  });

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
      </div>
    </>
  );
}
