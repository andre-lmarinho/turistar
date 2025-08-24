// src/features/planner/components/dnd/ActivityCardEditing.tsx
'use client';

import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { Palette, ArrowLeftRight, Trash2 } from 'lucide-react';
import type { Activity, DayPlan, CatalogActivity } from '@/shared/types';
import { Button } from '@/shared/ui';
import { useActivityPopupControls } from '@/shared/hooks/ui/useActivityPopupControls';
import { useElementRect } from '@/shared/hooks/ui/useElementRect';
import { useEscapeKey } from '@/shared/hooks/ui/useEscapeKey';
import { cn } from '@/shared/utils';

interface Props {
  activity: Activity & { dayId?: string };
  availableDays: DayPlan[];
  bgColor: string;
  onChangeColor: (color: string) => void;
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  onSave: (imageUrl: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  onApplyCatalogItem?: (item: CatalogActivity) => void;
  editedImageUrl: string;
  setEditedImageUrl: (url: string) => void;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export default function ActivityCardEditing({
  activity,
  availableDays,
  bgColor,
  onChangeColor,
  onChangeDay,
  onChangePosition,
  onSave,
  onCancel,
  onDelete,
  editedImageUrl,
  setEditedImageUrl,
  cardRef,
}: Props) {
  const {
    colorButtonRef,
    dateButtonRef,
    handleColorButtonClick,
    handleDateButtonClick,
    ColorPopup,
    DayPopup,
  } = useActivityPopupControls({
    activity,
    availableDays,
    bgColor,
    imageUrl: editedImageUrl,
    onChangeColor,
    onChangeDay,
    onChangePosition,
    onChangeImage: (url: string) => setEditedImageUrl(url),
    onClearImage: () => setEditedImageUrl(''),
  });
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const cardRect = useElementRect(cardRef);
  const buttonRect = useElementRect(buttonContainerRef);

  useEscapeKey({ onClose: onCancel });

  const gap = 8;
  const buttonGroupWidth = buttonRect?.width ?? 160;

  const position =
    cardRect && window.innerWidth - cardRect.right - gap >= buttonGroupWidth ? 'right' : 'left';

  const coords = cardRect
    ? {
        top: cardRect.top,
        left: position === 'right' ? cardRect.right + gap : cardRect.left - gap,
      }
    : null;

  if (!coords) return null;

  return (
    <>
      <div className="relative z-50 mt-2 flex">
        <Button
          type="button"
          size="sm"
          className="cursor-pointer"
          onClick={() => onSave(editedImageUrl)}
        >
          Update
        </Button>
      </div>
      {ReactDOM.createPortal(
        <div
          ref={buttonContainerRef}
          className={cn(
            'fixed z-50 flex flex-col',
            position === 'right' ? 'items-start' : '-translate-x-full items-end'
          )}
          style={{ top: coords.top, left: coords.left }}
        >
          <Button
            ref={dateButtonRef}
            size="sm"
            variant="icon"
            type="button"
            onClick={handleDateButtonClick}
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" />
            Move
          </Button>
          <div className="relative mb-1">
            {DayPopup && <div className="absolute top-1 left-full z-50">{DayPopup}</div>}
          </div>

          <Button
            ref={colorButtonRef}
            size="sm"
            variant="icon"
            type="button"
            onClick={handleColorButtonClick}
          >
            <Palette className="size-4" aria-hidden="true" />
            Card Colors
          </Button>
          <div className="relative mb-1">
            {ColorPopup && <div className="absolute top-1 left-full z-50">{ColorPopup}</div>}
          </div>

          <Button size="sm" variant="icon" type="button" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        </div>,
        document.body
      )}
    </>
  );
}
