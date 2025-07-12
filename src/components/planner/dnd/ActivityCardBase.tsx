// src/components/planner/dnd/ActivityCardBase.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { DollarSign, Hourglass } from 'lucide-react';
import { EMPTY_ACTIVITY_TITLE } from '@/constants';

interface ActivityCardBaseProps {
  title: string;
  draftTitle?: string;
  onDraftTitleChange?: (value: string) => void;
  onSave?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  imageUrl?: string;
  duration?: number;
  editing?: boolean;
  twBg?: string;
  budget?: number;
}

export function ActivityCardBase({
  title,
  draftTitle,
  onDraftTitleChange,
  onSave,
  inputRef,
  imageUrl,
  duration,
  editing = false,
  twBg,
  budget,
}: ActivityCardBaseProps) {
  const isMounted = typeof window !== 'undefined';

  return (
    <div
      role="button"
      className="group w-full text-left flex items-stretch rounded-lg border shadow-sm bg-white overflow-hidden hover:shadow-md transition cursor-grab relative"
      style={{ zIndex: editing ? 50 : undefined }}
    >
      <div className={`flex-1 flex w-40 flex-col ${twBg ?? ''}`}>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            width={400}
            height={200}
            unoptimized
            className="h-30 rounded-t-lg w-full object-cover"
          />
        )}

        <div className="mx-4 my-2">
          {editing ? (
            <input
              ref={inputRef}
              value={draftTitle}
              onChange={(e) => onDraftTitleChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSave?.();
                }
              }}
              className="w-full bg-background px-2 py-1 text-sm"
            />
          ) : (
            <h4 className="font-medium">{title.trim() ? title : EMPTY_ACTIVITY_TITLE}</h4>
          )}

          {isMounted && (duration! > 0 || budget! > 0) && (
            <div className="absolute top-2 left-2 flex gap-2 px-2 rounded-full text-xs bg-white">
              {duration! > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Hourglass size={12} />
                  {duration} h
                </span>
              )}
              {budget! > 0 && (
                <span className="inline-flex items-center gap-1">
                  <DollarSign size={12} /> {budget}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
