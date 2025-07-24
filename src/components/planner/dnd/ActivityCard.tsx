// src/components/planner/dnd/ActivityCard.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { Activity, DayPlan, CatalogActivity } from '@/types';
import { isTouchDevice } from '@/lib';

import { EditCardButton, ActivityCardBase, ActivityCardEditing } from '@/components';
import { DEFAULT_COLORS } from '@/constants';
import { useEscapeKey } from '@/hooks';

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
  const twBg = color && !color.startsWith('#') ? color : undefined;
  const colorClass = twBg ?? (bgColor && !bgColor.startsWith('#') ? bgColor : undefined);
  const colorIndex = colorClass ? DEFAULT_COLORS.findIndex((c) => c.bg === colorClass) : -1;
  const borderColorClass = colorIndex >= 0 ? DEFAULT_COLORS[colorIndex].border : undefined;
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [editedImageUrl, setEditedImageUrl] = useState(activity.imageUrl ?? '');
  const [overlayRect, setOverlayRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  useEscapeKey({ onClose: () => editing && cancel(), isActive: editing });

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    if (cardRef.current) {
      setOverlayRect(cardRef.current.getBoundingClientRect());
    }
    setEditing(true);
  }

  function save() {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== title) {
      onTitleSave?.(trimmed);
    }
    setEditing(false);
    setOverlayRect(null);
  }

  function cancel() {
    setDraftTitle(title);
    setEditing(false);
    setOverlayRect(null);
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
        style={{ visibility: editing ? 'hidden' : undefined }}
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
          if (!editing) startEditing();
        }}
      >
        <ActivityCardBase
          editing={false}
          title={title}
          draftTitle={draftTitle}
          onDraftTitleChange={setDraftTitle}
          onSave={save}
          inputRef={inputRef}
          imageUrl={imageUrl}
          duration={duration}
          twBg={twBg}
          budget={budget}
          borderColorClass={borderColorClass}
        />

        {!editing && (
          <EditCardButton
            type="button"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
          />
        )}
      </div>

      {editing &&
        overlayRect &&
        ReactDOM.createPortal(
          <div
            ref={overlayRef}
            className="fixed z-50"
            style={{ top: overlayRect.top, left: overlayRect.left, width: overlayRect.width }}
          >
            <ActivityCardBase
              editing={true}
              title={title}
              draftTitle={draftTitle}
              onDraftTitleChange={setDraftTitle}
              onSave={save}
              inputRef={inputRef}
              imageUrl={imageUrl}
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
              onDelete={() => onDelete?.()}
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
