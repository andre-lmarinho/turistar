'use client';

import React, { useEffect, useRef, useState } from 'react';

import type { Activity, DayPlan } from '@/features/planner/domain/types/PlannerEntities';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { useElementMeasure } from '@/shared/hooks/ui/useElementMeasure';
import { isTouchDevice } from '@/shared/utils/isTouchDevice';
import { useActivityCardEditor } from '@/features/planner/hooks/useActivityCardEditor';
import { useCardColors } from '@/features/planner/hooks/internal/useCardColors';
import ActivityCardBase from './ActivityCardBase';
import ActivityCardEditing from './ActivityCardEditing';

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

  const { editing, draft, setDraft, inputRef, cardRef, start, save, cancel } = useActivityCardEditor({
    title,
    onTitleSave,
  });

  const { rect: cardRect } = useElementMeasure({ ref: cardRef, rect: true });
  const actionsRef = useRef<HTMLDivElement>(null);
  const dialogTitleId = `activity-card-editor-${activity.id}`;

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
            onPointerDownOutside={(event) => {
              const target = event.target as Node | null;
              if (target && actionsRef.current?.contains(target)) {
                event.preventDefault();
              }
            }}
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
              onDelete={onDelete}
              editedImageUrl={editedImageUrl}
              setEditedImageUrl={setEditedImageUrl}
              cardRect={cardRect}
              actionsRef={actionsRef}
            />
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
