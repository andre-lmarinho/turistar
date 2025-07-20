// src/components/planner/dnd/ActivityCardEditing.tsx
'use client';

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Palette, ArrowLeftRight, Trash2, Search } from 'lucide-react';
import type { Activity, DayPlan, CatalogActivity } from '@/types';
import { Button, CardColorsPopup, DayPickerPopup, CatalogSearchPopup } from '@/components';
import { useCardPopups, useWindowSize, useFlexibleRef, useEscapeKey } from '@/hooks';
import { cn } from '@/lib/utils';

interface Props {
  activity: Activity & { dayId?: string };
  availableDays: DayPlan[];
  bgColor: string;
  onChangeColor: (color: string) => void;
  onChangeDay: (dayId: string) => void;
  onChangePosition: (index: number) => void;
  onSave: () => void;
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
  onApplyCatalogItem,
  cardRef,
}: Props) {
  const {
    colorButtonRef,
    dateButtonRef,
    isColorPickerOpen,
    isDatePickerOpen,
    handleColorButtonClick,
    handleDateButtonClick,
    setIsColorPickerOpen,
    setIsDatePickerOpen,
    setIsPositionPickerOpen,
  } = useCardPopups();
  const searchButtonRef = useFlexibleRef();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const cardRect = useWindowSize(cardRef);
  const buttonRect = useWindowSize(buttonContainerRef);

  useEscapeKey({ onClose: onCancel });

  const gap = 8;
  const buttonGroupWidth = buttonRect?.width ?? 160;

  const currentDay = availableDays.find((d) => d.id === activity.dayId);
  const currentIndex = currentDay?.activities.findIndex((a) => a.id === activity.id) ?? -1;

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
      <div className="relative mt-2 z-50 flex">
        <Button type="button" size="sm" className="cursor-pointer" onClick={onSave}>
          Update
        </Button>
      </div>
      {ReactDOM.createPortal(
        <div
          ref={buttonContainerRef}
          className={cn(
            'fixed z-50 flex flex-col',
            position === 'right' ? 'items-start' : 'items-end -translate-x-full'
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
            {isDatePickerOpen && availableDays?.length > 0 && (
              <div className="absolute top-1 left-full z-50">
                <DayPickerPopup
                  days={availableDays}
                  selected={activity.dayId}
                  selectedIndex={currentIndex}
                  onSelect={(dayId: string) => {
                    onChangeDay(dayId);
                    setIsDatePickerOpen(false);
                  }}
                  onSelectIndex={(idx: number) => onChangePosition(idx)}
                  onClose={() => setIsDatePickerOpen(false)}
                  triggerRef={dateButtonRef}
                />
              </div>
            )}
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
            {isColorPickerOpen && (
              <div className="absolute top-1 left-full z-50">
                <CardColorsPopup
                  imageUrl={editedImageUrl}
                  onChangeImage={(url: string) => setEditedImageUrl(url)}
                  onClearImage={() => setEditedImageUrl('')}
                  selectedColor={bgColor}
                  onChangeColor={(selectedColor: string) => {
                    onChangeColor(selectedColor);
                    setIsColorPickerOpen(false);
                  }}
                  onClose={() => setIsColorPickerOpen(false)}
                  triggerRef={colorButtonRef}
                />
              </div>
            )}
          </div>

          <Button
            ref={searchButtonRef}
            size="sm"
            variant="icon"
            type="button"
            onClick={() => {
              setIsCatalogOpen((p) => !p);
              setIsColorPickerOpen(false);
              setIsDatePickerOpen(false);
              setIsPositionPickerOpen(false);
            }}
          >
            <Search className="size-4" aria-hidden="true" />
            Search Catalog
          </Button>
          <div className="relative mb-1">
            {isCatalogOpen && (
              <div className="absolute top-1 left-full z-50">
                <CatalogSearchPopup
                  open={isCatalogOpen}
                  onSelect={(item) => {
                    onApplyCatalogItem?.(item);
                    setEditedImageUrl(item.image_url || '');
                    setIsCatalogOpen(false);
                  }}
                  onClose={() => setIsCatalogOpen(false)}
                  triggerRef={searchButtonRef}
                />
              </div>
            )}
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
