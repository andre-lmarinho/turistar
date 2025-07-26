// src/components/planner/dnd/ActivityCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { isTouchDevice } from '@/lib';
import { ActivityCardBase, ActivityCardEditing, EditCardButton } from '@/components';
import { useActivityCardEditor, useCardColors } from '@/hooks';
import type { Activity, DayPlan, CatalogActivity } from '@/types';

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
  onApplyCatalogItem?: (item: CatalogActivity) => void;
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
  onApplyCatalogItem,
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

  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (editing && cardRef.current) {
      setRect(cardRef.current.getBoundingClientRect());
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    const update = () => {
      if (cardRef.current) {
        setRect(cardRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [editing]);

  return (
    <>
      {editing &&
        createPortal(<div className="backdrop-overlay" onClick={cancel} />, document.body)}
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
          <EditCardButton
            type="button"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              start();
            }}
          />
        )}
      </div>

      {editing &&
        rect &&
        createPortal(
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
          >
            <ActivityCardBase
              editing={true}
              title={title}
              draftTitle={draft}
              onDraftTitleChange={setDraft}
              onSave={save}
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
              onSave={save}
              onCancel={cancel}
              onDelete={onDelete}
              onApplyCatalogItem={onApplyCatalogItem}
              editedImageUrl={editedImageUrl}
              setEditedImageUrl={setEditedImageUrl}
            />
          </div>,
          document.body
        )}
    </>
  );
}
