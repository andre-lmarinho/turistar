'use client';

import React, { useEffect } from 'react';

import type { Activity } from '@/features/planner/domain/types/PlannerEntities';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { useElementMeasure } from '@/shared/hooks/ui/useElementMeasure';
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

  const { editing, draft, setDraft, inputRef, cardRef, start, save, cancel } =
    useActivityCardEditor({
      title,
      onTitleSave,
    });

  const { rect: cardRect } = useElementMeasure({ ref: cardRef, rect: true });
  const dialogTitleId = `activity-card-editor-${activity.id}`;

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

        {!editing && (
          <Button
            variant="icon"
            size="icon"
            title="Edit Card"
            position="bottom"
            type="button"
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
            icon="pencil"
            onClick={(e) => {
              e.stopPropagation();
              start();
            }}
          />
        )}
      </div>

      <Dialog open={editing} onClose={cancel}>
        {cardRect ? (
          <DialogContent
            position="inline"
            scroll="body"
            className="pointer-events-auto bg-transparent p-0 shadow-none"
            style={{ top: cardRect.top, left: cardRect.left, width: cardRect.width }}
            aria-labelledby={dialogTitleId}
            aria-describedby={undefined}
          >
            <h2 id={dialogTitleId} className="sr-only">
              Edit activity card
            </h2>
            <ActivityCardBase
              editing
              title={title}
              draftTitle={draft}
              onDraftTitleChange={setDraft}
              onSave={() => {
                save();
              }}
              inputRef={inputRef}
              imageUrl={imageUrl}
              duration={duration}
              twBg={twBg}
              budget={budget}
              borderColorClass={borderColorClass}
            />
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
